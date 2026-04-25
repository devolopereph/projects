import { NextRequest, NextResponse } from 'next/server';
import { requireElevatedAdmin } from '@/lib/auth-guards';
import { saveOptimizedImage, calculateImageHash, checkExistingImage, registerImage } from '@/lib/image-utils';
import * as fs from 'fs';
import * as path from 'path';
import * as yauzl from 'yauzl';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get('zipFile') as File;
    const password = formData.get('password') as string;
    const sessionBased = formData.get('sessionBased') as string;

    if (!zipFile) {
      return NextResponse.json({ error: 'ZIP dosyası gerekli' }, { status: 400 });
    }

    const auth = await requireElevatedAdmin({
      token: password,
      sessionBased: sessionBased === 'true',
    });
    if ('response' in auth) {
      return auth.response;
    }

    // ZIP dosyasını geçici olarak kaydet
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempZipPath = path.join(tempDir, `backup-${Date.now()}.zip`);
    const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
    fs.writeFileSync(tempZipPath, zipBuffer);

    try {
      // ZIP dosyasını unzip et ve import et
      await importZipBackup(tempZipPath);
      
      // Geçici dosyayı sil
      if (fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }

      return NextResponse.json({ success: true, message: 'ZIP yedek başarıyla geri yüklendi' });
    } catch (error) {
      // Geçici dosyayı sil
      if (fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
      throw error;
    }

  } catch (error) {
    console.error('ZIP import error:', error);
    return NextResponse.json({ error: 'ZIP import edilirken hata oluştu' }, { status: 500 });
  }
}

async function importZipBackup(zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error('ZIP dosyası açılamadı: ' + err.message));
        return;
      }

      if (!zipfile) {
        reject(new Error('ZIP dosyası bulunamadı'));
        return;
      }

      let backupData: Record<string, unknown> | null = null;
      const extractedImages: string[] = [];
      const imageUrlMapping: Record<string, string> = {}; // Eski URL -> Yeni URL mapping
      let processedEntries = 0;
      const totalEntries = zipfile.entryCount;

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        if (entry.fileName === 'backup.json') {
          // JSON verisini oku
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(new Error('JSON dosyası okunamadı: ' + err.message));
              return;
            }

            if (!readStream) {
              reject(new Error('JSON stream oluşturulamadı'));
              return;
            }

            let jsonData = '';
            readStream.on('data', (chunk) => {
              jsonData += chunk.toString();
            });

            readStream.on('end', () => {
              try {
                backupData = JSON.parse(jsonData);
                processedEntries++;
                
                if (processedEntries === totalEntries) {
                  finishImport();
                } else {
                  zipfile.readEntry();
                }
              } catch (error) {
                reject(new Error('JSON parse edilemedi: ' + (error as Error).message));
              }
            });

            readStream.on('error', (error) => {
              reject(new Error('JSON okuma hatası: ' + error.message));
            });
          });
        } else if (entry.fileName.startsWith('uploads/')) {
          // Görsel dosyalarını optimize ederek uploads klasörüne çıkart
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              console.warn('Görsel dosyası okunamadı:', entry.fileName, err.message);
              processedEntries++;
              
              if (processedEntries === totalEntries) {
                finishImport();
              } else {
                zipfile.readEntry();
              }
              return;
            }

            if (!readStream) {
              console.warn('Görsel stream oluşturulamadı:', entry.fileName);
              processedEntries++;
              
              if (processedEntries === totalEntries) {
                finishImport();
              } else {
                zipfile.readEntry();
              }
              return;
            }

            // Görsel verisini buffer'a topla
            const chunks: Buffer[] = [];
            readStream.on('data', (chunk) => {
              chunks.push(chunk);
            });

            readStream.on('end', async () => {
              try {
                const imageBuffer = Buffer.concat(chunks);
                
                // Görsel hash'ini hesapla
                const imageHash = calculateImageHash(imageBuffer);
                
                // Aynı görsel zaten var mı kontrol et
                const existingImage = await checkExistingImage(imageHash);
                
                if (existingImage) {
                   // Aynı görsel zaten var, sadece kullanım sayısını artır
                   console.log(`Görsel zaten mevcut: ${entry.fileName} -> ${existingImage.file_path}`);
                   extractedImages.push(existingImage.file_path);
                   imageUrlMapping[`/${entry.fileName}`] = existingImage.file_path;
                 } else {
                   // Yeni görsel, optimize et ve kaydet
                   const fileName = entry.fileName.split('/').pop() || entry.fileName;
                   const optimizedImagePath = await saveOptimizedImage(imageBuffer, fileName);
                   
                   // Veritabanına kaydet
                   await registerImage(imageHash, optimizedImagePath);
                   
                   console.log(`Görsel optimize edildi: ${entry.fileName} -> ${optimizedImagePath}`);
                   extractedImages.push(optimizedImagePath);
                   imageUrlMapping[`/${entry.fileName}`] = optimizedImagePath;
                 }
                
                processedEntries++;
                
                if (processedEntries === totalEntries) {
                  finishImport();
                } else {
                  zipfile.readEntry();
                }
              } catch (error) {
                console.warn('Görsel işleme hatası:', entry.fileName, (error as Error).message);
                processedEntries++;
                
                if (processedEntries === totalEntries) {
                  finishImport();
                } else {
                  zipfile.readEntry();
                }
              }
            });

            readStream.on('error', (error) => {
              console.warn('Görsel okuma hatası:', entry.fileName, error.message);
              processedEntries++;
              
              if (processedEntries === totalEntries) {
                finishImport();
              } else {
                zipfile.readEntry();
              }
            });
          });
        } else {
          // Diğer dosyaları atla
          processedEntries++;
          
          if (processedEntries === totalEntries) {
            finishImport();
          } else {
            zipfile.readEntry();
          }
        }
      });

      zipfile.on('end', () => {
        if (processedEntries === totalEntries) {
          finishImport();
        }
      });

      zipfile.on('error', (error) => {
        reject(new Error('ZIP okuma hatası: ' + error.message));
      });

      async function finishImport() {
        try {
          if (backupData) {
            // Ürün görsel URL'lerini güncelle
            if (backupData.products && Array.isArray(backupData.products)) {
              backupData.products = backupData.products.map((product: Record<string, unknown>) => {
                if (product.image_url && typeof product.image_url === 'string' && imageUrlMapping[product.image_url]) {
                  return {
                    ...product,
                    image_url: imageUrlMapping[product.image_url]
                  };
                }
                return product;
              });
            }
            
            // JSON verisini import et
            const { importAllData } = await import('@/lib/backup');
            await importAllData(backupData);
            console.log('ZIP import tamamlandı. Çıkarılan görseller:', extractedImages.length);
            console.log('Görsel URL mapping:', imageUrlMapping);
            resolve();
          } else {
            reject(new Error('Backup verisi bulunamadı'));
          }
        } catch (error) {
          reject(new Error('Veri import hatası: ' + (error as Error).message));
        }
      }
    });
  });
}
