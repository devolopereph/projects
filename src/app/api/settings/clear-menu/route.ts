import { NextRequest, NextResponse } from 'next/server';
import { getDb, allQuery } from '@/lib/db';
import { requireElevatedAdmin } from '@/lib/auth-guards';
import { deleteAllImages, isLogoImage } from '@/lib/image-utils';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { password, sessionBased } = await request.json();

    const auth = await requireElevatedAdmin({ token: password, sessionBased: Boolean(sessionBased) });
    if ('response' in auth) {
      return auth.response;
    }

    // Sadece menü verilerini temizle
    await clearMenuData();
    return NextResponse.json({ success: true, message: 'Menü verileri başarıyla temizlendi' });
    
  } catch (error) {
    console.error('Clear menu API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

async function clearMenuData() {
  const db = getDb();
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // Önce tabloların var olup olmadığını kontrol et
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products', 'categories', 'product_views', 'image_registry')").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);
    
    // Tüm fotoğrafları temizle (logo hariç)
    try {
      const deletedCount = await deleteAllImages();
      console.log(`${deletedCount} fotoğraf temizlendi (logo korundu)`);
    } catch (imageError) {
      console.error('Error deleting images:', imageError);
      // Fallback: Eski sistem ile fotoğrafları temizle
      await fallbackImageCleanup(tableNames);
    }
    
    // Menü verilerini temizle (sadece mevcut tablolar)
    if (tableNames.includes('product_views')) {
      db.exec('DELETE FROM product_views');
    }
    if (tableNames.includes('products')) {
      db.exec('DELETE FROM products');
    }
    if (tableNames.includes('categories')) {
      db.exec('DELETE FROM categories');
    }
    
    // Auto increment değerlerini sıfırla (sadece mevcut tablolar için)
    const sequenceTableNames = tableNames.filter(name => ['categories', 'products', 'product_views'].includes(name));
    if (sequenceTableNames.length > 0) {
      const placeholders = sequenceTableNames.map(() => '?').join(', ');
      db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${placeholders})`).run(...sequenceTableNames);
    }
    
    db.exec('COMMIT');
    
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    console.error('Clear menu data error:', error);
    throw new Error('Menü verileri temizlenirken hata oluştu: ' + (error as Error).message);
  }
}

// Fallback: Image registry olmadığında eski sistem ile temizle
async function fallbackImageCleanup(tableNames: string[]) {
  if (tableNames.includes('products')) {
    try {
      const products = await allQuery('SELECT image_url FROM products WHERE image_url IS NOT NULL AND image_url != \'\'') as { image_url: string }[];
      
      // Ürün resimlerini sil
      for (const product of products) {
        deleteImageFile(product.image_url);
      }
      
      console.log(`${products.length} fotoğraf temizlendi (fallback method)`);
    } catch (queryError) {
      console.error('Error querying products for images:', queryError);
    }
  }
}

// Resim dosyasını sil (logo hariç)
function deleteImageFile(imageUrl: string) {
  if (!imageUrl || isLogoImage(imageUrl)) {
    return;
  }

  try {
    // URL'den dosya yolunu çıkar
    const relativePath = imageUrl.startsWith('/uploads/')
      ? imageUrl.slice('/uploads/'.length)
      : imageUrl.replace(/^uploads\//, '');
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const filePath = path.resolve(uploadsDir, relativePath);
    if (filePath === uploadsDir || !filePath.startsWith(`${uploadsDir}${path.sep}`)) {
      return;
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted product image:', filePath);
    } else {
      console.log('Image file not found:', filePath);
    }
  } catch (error) {
    console.error('Error deleting image file:', imageUrl, error);
  }
}
