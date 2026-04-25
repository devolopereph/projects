import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getQuery, runQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { username, token } = await request.json();
    if (!username || !token) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    // Kullanıcıdan 2FA secret'ı al
    const user = await getQuery('SELECT twofa_secret FROM users WHERE username = ?', [username]) as { twofa_secret?: string } | null | undefined;
    console.log('2FA DELETE - USER:', user);
    if (!user || user.twofa_secret == null || user.twofa_secret === undefined) {
      return NextResponse.json({ error: '2FA aktif değil' }, { status: 400 });
    }
    // 2FA kodunu doğrula
    const valid = verify2FACode(user.twofa_secret, token);
    if (!valid) {
      return NextResponse.json({ valid: false, error: 'Kod doğrulanamadı' }, { status: 200 });
    }
    // 2FA secret'ı sil
    const result = await runQuery('UPDATE users SET twofa_secret = NULL WHERE username = ?', [username]);
    console.log('2FA DELETE - DB RESULT:', result);
    return NextResponse.json({ valid: true, message: '2FA kaldırıldı' });
  } catch (error) {
    console.error('2FA delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
