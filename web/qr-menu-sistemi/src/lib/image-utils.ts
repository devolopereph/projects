import sharp from 'sharp';
import { createHash } from 'crypto';
import { existsSync, unlinkSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { basename, join, resolve, sep } from 'path';
import { runQuery, allQuery } from '@/lib/db';

export interface ImageProcessingResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  isExisting?: boolean;
}

export function isLogoImage(filePath: string): boolean {
  const name = basename(filePath).toLowerCase();
  return name === 'logo.png' || name.includes('logo');
}

function resolveUploadFilePath(filePath: string): string | null {
  if (!filePath || filePath.includes('\0')) {
    return null;
  }

  const uploadPrefix = '/uploads/';
  const relativePath = filePath.startsWith(uploadPrefix)
    ? filePath.slice(uploadPrefix.length)
    : filePath.replace(/^uploads\//, '');

  if (!relativePath) {
    return null;
  }

  const uploadsDir = resolve(process.cwd(), 'public', 'uploads');
  const fullPath = resolve(uploadsDir, relativePath);

  if (fullPath !== uploadsDir && fullPath.startsWith(`${uploadsDir}${sep}`)) {
    return fullPath;
  }

  return null;
}

// Fotoğraf hash'i hesaplama
export function calculateImageHash(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('hex');
}

// Fotoğraf optimizasyonu ve WebP dönüştürme
export async function processAndOptimizeImage(
  buffer: Buffer, 
  originalName: string,
  maxWidth: number = 800,
  quality: number = 80
): Promise<{ optimizedBuffer: Buffer; filename: string }> {
  // Dosya hash'i hesapla
  const imageHash = calculateImageHash(buffer);
  
  // WebP formatında optimize et
  const optimizedBuffer = await sharp(buffer)
    .resize(maxWidth, null, { 
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality })
    .toBuffer();

  // Temiz dosya adı oluştur
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Uzantıyı kaldır
    .replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 30);
  
  const filename = `${imageHash}_${cleanName}.webp`;
  
  return { optimizedBuffer, filename };
}

// Optimize edilmiş görseli diske kaydet ve path döndür
export async function saveOptimizedImage(
  buffer: Buffer, 
  originalName: string,
  maxWidth: number = 800,
  quality: number = 80
): Promise<string> {
  const { optimizedBuffer, filename } = await processAndOptimizeImage(buffer, originalName, maxWidth, quality);
  
  // Uploads klasörünü oluştur
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Dosyayı kaydet
  const filePath = join(uploadsDir, filename);
  writeFileSync(filePath, optimizedBuffer);
  
  return `/uploads/${filename}`;
}

// Mevcut fotoğrafı kontrol et (hash bazlı)
export async function checkExistingImage(imageHash: string): Promise<{ file_path: string } | null> {
  try {
    const result = await allQuery(
      'SELECT file_path FROM image_registry WHERE hash = ? LIMIT 1',
      [imageHash]
    ) as { file_path: string }[];
    
    if (result.length > 0) {
      const filePath = resolveUploadFilePath(result[0].file_path);
      if (filePath && existsSync(filePath)) {
        return { file_path: result[0].file_path };
      } else {
        // Dosya yoksa kayıttan sil
        await runQuery('DELETE FROM image_registry WHERE hash = ?', [imageHash]);
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking existing image:', error);
    return null;
  }
}

// Fotoğraf kaydını veritabanına ekle
export async function registerImage(hash: string, filePath: string): Promise<void> {
  try {
    await runQuery(
      'INSERT OR REPLACE INTO image_registry (hash, file_path, created_at) VALUES (?, ?, ?)',
      [hash, filePath, new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error registering image:', error);
  }
}

// Fotoğraf kullanım sayısını artır
export async function incrementImageUsage(filePath: string): Promise<void> {
  try {
    await runQuery(
      'UPDATE image_registry SET usage_count = usage_count + 1 WHERE file_path = ?',
      [filePath]
    );
  } catch (error) {
    console.error('Error incrementing image usage:', error);
  }
}

// Fotoğraf kullanım sayısını azalt
export async function decrementImageUsage(filePath: string): Promise<void> {
  try {
    const result = await allQuery(
      'SELECT usage_count FROM image_registry WHERE file_path = ? LIMIT 1',
      [filePath]
    ) as { usage_count: number }[];
    
    if (result.length > 0) {
      const newCount = Math.max(0, result[0].usage_count - 1);
      
      if (newCount === 0) {
        // Kullanım sayısı 0 ise fotoğrafı sil
        await deleteUnusedImage(filePath);
      } else {
        await runQuery(
          'UPDATE image_registry SET usage_count = ? WHERE file_path = ?',
          [newCount, filePath]
        );
      }
    }
  } catch (error) {
    console.error('Error decrementing image usage:', error);
  }
}

// Kullanılmayan fotoğrafı sil
export async function deleteUnusedImage(filePath: string): Promise<void> {
  try {
    if (isLogoImage(filePath)) {
      return;
    }
    
    // Veritabanından kayıtı sil
    await runQuery('DELETE FROM image_registry WHERE file_path = ?', [filePath]);
    
    // Fiziksel dosyayı sil
    const fullPath = resolveUploadFilePath(filePath);
    if (fullPath && existsSync(fullPath)) {
      unlinkSync(fullPath);
      console.log('Deleted unused image:', fullPath);
    }
  } catch (error) {
    console.error('Error deleting unused image:', error);
  }
}

// Eski fotoğraf sisteminden yeni sisteme geçiş için cleanup
export async function cleanupOrphanedImages(): Promise<void> {
  try {
    // Kullanılmayan fotoğrafları bul ve sil
    const orphanedImages = await allQuery(
      'SELECT file_path FROM image_registry WHERE usage_count = 0'
    ) as { file_path: string }[];
    
    for (const image of orphanedImages) {
      await deleteUnusedImage(image.file_path);
    }
    
    console.log(`Cleaned up ${orphanedImages.length} orphaned images`);
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
  }
}

// Tüm fotoğrafları sil (logo hariç) - Menü temizleme için
export async function deleteAllImages(): Promise<number> {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    let deletedCount = 0;
    
    if (existsSync(uploadsDir)) {
      const files = readdirSync(uploadsDir);
      
      for (const file of files) {
        if (isLogoImage(file)) {
          continue;
        }
        
        const filePath = join(uploadsDir, file);
        try {
          unlinkSync(filePath);
          deletedCount++;
          console.log('Deleted file:', file);
        } catch (error) {
          console.error('Error deleting file:', file, error);
        }
      }
    }
    
    // Image registry'yi temizle (logo hariç)
    try {
      await runQuery('DELETE FROM image_registry WHERE lower(file_path) NOT LIKE ?', ['%logo%']);
    } catch (error) {
      console.error('Error clearing image registry:', error);
    }
    
    console.log(`Deleted ${deletedCount} images (logo preserved)`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting all images:', error);
    return 0;
  }
}
