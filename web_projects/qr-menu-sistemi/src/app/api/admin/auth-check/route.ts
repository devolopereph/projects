import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.username) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      username: session.user.username 
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Oturum doğrulama hatası' }, { status: 401 });
  }
}