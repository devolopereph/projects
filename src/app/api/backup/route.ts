import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getDb } from '@/lib/db';
import { importAllData } from '@/lib/backup';
import { requireElevatedAdmin } from '@/lib/auth-guards';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { password, action, data, includeImages, sessionBased } = await request.json();

    const auth = await requireElevatedAdmin({ token: password, sessionBased: Boolean(sessionBased) });
    if ('response' in auth) {
      return auth.response;
    }

    if (action === 'export') {
      if (includeImages) {
        // Görseller dahil zip dosyası oluştur
        return await createBackupWithImages();
      } else {
        // Sadece JSON verisi
        const backup = await exportAllData();
        return NextResponse.json({ 
          success: true, 
          data: backup,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (action === 'import') {
      // Verileri import et
      if (data && typeof data === 'object' && !Buffer.isBuffer(data)) {
        // JSON verisi - direkt import et
        await importAllData(data);
      } else {
        // ZIP dosyası olabilir - multipart/form-data olarak geldi
        return NextResponse.json({ error: 'ZIP import için farklı endpoint kullanın' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Yedek başarıyla geri yüklendi' });
    } else if (action === 'clear') {
      // Tüm verileri temizle
      await clearAllData();
      return NextResponse.json({ success: true, message: 'Tüm veriler başarıyla temizlendi' });
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

async function exportAllData() {
  try {
    // Kategorileri al
    const categories = await allQuery('SELECT * FROM categories ORDER BY order_index');
    
    // Ürünleri al
    const products = await allQuery('SELECT * FROM products ORDER BY category_id, order_index');
    
    // Ayarları al
    const settings = await allQuery('SELECT * FROM settings');
    
    // Analytics verilerini al
    const productViews = await allQuery('SELECT * FROM product_views');
    const siteVisits = await allQuery('SELECT * FROM site_visits');
    const visitorSessions = await allQuery('SELECT * FROM visitor_sessions');
    
    return {
      categories,
      products,
      settings,
      productViews,
      siteVisits,
      visitorSessions,
      version: '1.0',
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Veri export edilirken hata oluştu');
  }
}

async function clearAllData(commit = true) {
  const db = getDb();
  
  try {
    if (commit) {
      db.exec('BEGIN TRANSACTION');
    }
    
    // Tabloları temizle (foreign key constraints nedeniyle sıra önemli)
    db.exec('DELETE FROM product_views');
    db.exec('DELETE FROM site_visits');
    db.exec('DELETE FROM visitor_sessions');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM settings');
    
    // Auto increment değerlerini sıfırla
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('categories', 'products', 'settings', 'product_views', 'site_visits', 'visitor_sessions')");
    
    if (commit) {
      db.exec('COMMIT');
    }
    
  } catch (error) {
    if (commit) {
      db.exec('ROLLBACK');
    }
    console.error('Clear data error:', error);
    throw new Error('Veriler temizlenirken hata oluştu');
  }
}

async function createBackupWithImages(): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    try {
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      const chunks: Buffer[] = [];
      
      archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const response = new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.zip"`,
            'Content-Length': buffer.length.toString()
          }
        });
        resolve(response);
      });

      archive.on('error', (err: Error) => {
        console.error('Archive error:', err);
        reject(new NextResponse(JSON.stringify({ error: 'Yedekleme dosyası oluşturulurken hata oluştu' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      });

      // JSON verisini ekle
      exportAllData().then(backup => {
        archive.append(JSON.stringify(backup, null, 2), { name: 'backup.json' });

        // Uploads klasörünü ekle
        const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
        if (fs.existsSync(uploadsPath)) {
          archive.directory(uploadsPath, 'uploads');
        }

        archive.finalize();
      }).catch(err => {
        console.error('Export data error:', err);
        reject(new NextResponse(JSON.stringify({ error: 'Veri export edilirken hata oluştu' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      });

    } catch (error) {
      console.error('Create backup error:', error);
      reject(new NextResponse(JSON.stringify({ error: 'Yedekleme oluşturulurken hata oluştu' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  });
}
