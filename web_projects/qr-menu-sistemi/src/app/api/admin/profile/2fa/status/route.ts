import { NextResponse } from 'next/server';
import { getQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface User {
  twofa_secret?: string | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Kullanıcıyı getir
    const user = await getQuery('SELECT twofa_secret FROM users WHERE username = ?', [session.user.username]) as User;
    return NextResponse.json({ twofa_secret: user?.twofa_secret || null });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
