import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireAdminSession } from '@/lib/auth-guards';
import { 
  processAndOptimizeImage, 
  calculateImageHash, 
  checkExistingImage, 
  registerImage, 
  incrementImageUsage,
  decrementImageUsage,
  isLogoImage
} from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const oldImageUrl = formData.get('oldImageUrl') as string;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ 
        success: false,
        error: 'Dosya seçilmedi' 
      }, { status: 400 });
    }

    // Type assertion after validation
    const uploadFile = file as File;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(uploadFile.type)) {
      return NextResponse.json({ 
        success: false,
        error: 'Geçersiz dosya türü. Sadece JPEG, PNG ve WebP dosyaları kabul edilir.' 
      }, { status: 400 });
    }

    // Check file size (max 2MB - reduced from 5MB for better performance)
    if (uploadFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        error: 'Dosya çok büyük. Maksimum boyut 2MB olmalıdır.' 
      }, { status: 400 });
    }

    // Check if file is empty
    if (uploadFile.size === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Dosya boş olamaz' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await uploadFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate image hash to check for duplicates
    const imageHash = calculateImageHash(buffer);
    
    // Check if this image already exists
    const existingImagePath = await checkExistingImage(imageHash);
    
    if (existingImagePath) {
      // Image already exists, increment usage count and return existing path
      await incrementImageUsage(existingImagePath.file_path);
      
      // Handle old image cleanup
      if (oldImageUrl && !isLogoImage(oldImageUrl) && oldImageUrl !== existingImagePath.file_path) {
        await decrementImageUsage(oldImageUrl);
      }
      
      return NextResponse.json({ 
        success: true, 
        imageUrl: existingImagePath.file_path,
        message: 'Mevcut fotoğraf kullanıldı (deduplication)',
        isExisting: true
      });
    }

    // Process and optimize image (convert to WebP, resize, compress)
    const { optimizedBuffer, filename } = await processAndOptimizeImage(
      buffer, 
      uploadFile.name,
      800, // Max width
      80   // Quality
    );

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save optimized image
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, optimizedBuffer);

    // Register new image in database
    const imageUrl = `/uploads/${filename}`;
    await registerImage(imageHash, imageUrl);

    // Handle old image cleanup
    if (oldImageUrl && !isLogoImage(oldImageUrl)) {
      await decrementImageUsage(oldImageUrl);
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Fotoğraf başarıyla optimize edildi ve yüklendi',
      isExisting: false
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Dosya yüklenirken hata oluştu' 
    }, { status: 500 });
  }
}
