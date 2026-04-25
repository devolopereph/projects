import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function POST() {
  try {
    // Admin authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset all analytics data
    await runQuery('DELETE FROM product_views');
    await runQuery('DELETE FROM site_visits');
    await runQuery('DELETE FROM visitor_sessions');

    // Reset auto-increment sequences if they exist
    try {
      await runQuery("DELETE FROM sqlite_sequence WHERE name IN ('product_views', 'site_visits', 'visitor_sessions')");
    } catch (error) {
      // Ignore error if sqlite_sequence doesn't exist
      console.log('sqlite_sequence table not found or error resetting sequences:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tüm istatistikler başarıyla sıfırlandı' 
    });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    return NextResponse.json({ 
      error: 'İstatistikler sıfırlanırken hata oluştu' 
    }, { status: 500 });
  }
}