import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-guards';
import { decrementImageUsage, isLogoImage } from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ('response' in auth) {
      return auth.response;
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ 
        success: false,
        error: 'Resim URL\'si belirtilmedi' 
      }, { status: 400 });
    }

    if (isLogoImage(imageUrl)) {
      return NextResponse.json({ 
        success: false,
        error: 'Logo silinemez' 
      }, { status: 400 });
    }

    // Akıllı silme: Sadece başka ürün kullanmıyorsa sil
    await decrementImageUsage(imageUrl);
    
    return NextResponse.json({ 
      success: true,
      message: 'Resim kullanım sayısı azaltıldı. Eğer başka ürün kullanmıyorsa silindi.'
    });

  } catch (error) {
    console.error('Error processing image deletion:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Resim silinirken hata oluştu' 
    }, { status: 500 });
  }
}
