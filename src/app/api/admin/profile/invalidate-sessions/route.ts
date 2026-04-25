import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { runQuery } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının password_changed_at timestamp'ini güncelle
    // Bu sayede mevcut oturumlar geçersiz hale gelir
    await runQuery(
      'UPDATE users SET password_changed_at = CURRENT_TIMESTAMP WHERE username = ?',
      [session.user.username]
    );

    return NextResponse.json({ 
      message: 'Tüm oturumlar başarıyla sonlandırıldı',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session invalidation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
