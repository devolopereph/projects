import { getDb, runQuery } from '@/lib/db';
import { incrementImageUsage } from '@/lib/image-utils';

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr?: string;
  description_en?: string;
  description_ar?: string;
  order_index: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: number;
  category_id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr?: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  image_url?: string;
  order_index: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Setting {
  id?: number;
  key: string;
  value_tr?: string;
  value_en?: string;
  value_ar?: string;
  created_at?: string;
}

interface BackupData {
  categories?: Category[];
  products?: Product[];
  settings?: Setting[];
  version?: string;
  exportDate?: string;
}

export async function importAllData(backupData: BackupData) {
  const db = getDb();
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // Foreign key constraints'leri geçici olarak devre dışı bırak
    db.exec('PRAGMA foreign_keys = OFF');
    
    // Sadece menü ile ilgili verileri temizle
    await runQuery('DELETE FROM product_views');
    await runQuery('DELETE FROM daily_menu');
    await runQuery('DELETE FROM products');
    await runQuery('DELETE FROM categories');
    // Settings tablosunu tamamen boşalt (menü ayarları için)
    await runQuery('DELETE FROM settings');
    
    // Foreign key constraints'leri tekrar aktif et
    db.exec('PRAGMA foreign_keys = ON');
    
    // Kategorileri import et
    if (backupData.categories) {
      for (const category of backupData.categories) {
        await runQuery(
          'INSERT INTO categories (id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, order_index, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            category.id,
            category.name_tr,
            category.name_en,
            category.name_ar,
            category.description_tr || null,
            category.description_en || null,
            category.description_ar || null,
            category.order_index,
            category.is_active !== false ? 1 : 0,
            category.created_at || new Date().toISOString(),
            category.updated_at || new Date().toISOString()
          ]
        );
      }
    }
    
    // Ürünleri import et
    if (backupData.products) {
      for (const product of backupData.products) {
        await runQuery(
          'INSERT INTO products (id, category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, original_price, discount_percent, image_url, order_index, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            product.id,
            product.category_id,
            product.name_tr,
            product.name_en,
            product.name_ar,
            product.description_tr || null,
            product.description_en || null,
            product.description_ar || null,
            product.price,
            product.original_price || null,
            product.discount_percent || null,
            product.image_url || null,
            product.order_index,
            product.is_published !== false ? 1 : 0,
            product.created_at || new Date().toISOString(),
            product.updated_at || new Date().toISOString()
          ]
        );
        
        // Görsel kullanım sayısını artır
        if (product.image_url && product.image_url !== '/uploads/logo.png') {
          try {
            await incrementImageUsage(product.image_url);
          } catch (error) {
            console.warn('Image usage increment failed for:', product.image_url, error);
          }
        }
      }
    }
    
    // Ayarları import et (menü ile ilgili ayarlar)
    if (backupData.settings) {
      for (const setting of backupData.settings) {
        await runQuery(
          'INSERT OR REPLACE INTO settings (id, key, value_tr, value_en, value_ar, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [
            setting.id || null,
            setting.key,
            setting.value_tr || null,
            setting.value_en || null,
            setting.value_ar || null,
            setting.created_at || new Date().toISOString()
          ]
        );
      }
    }
    
    db.exec('COMMIT');
    console.log('Backup import tamamlandı');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Backup import hatası:', error);
    throw error;
  }
}
