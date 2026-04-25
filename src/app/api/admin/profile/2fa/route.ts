import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { runQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { username, secret, token, backupCode } = await request.json();
    if (!secret || !username || !token || !backupCode) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    // 2FA kodunu doğrula
    const valid = verify2FACode(secret, token);
    if (!valid) {
      return NextResponse.json({ valid: false, error: 'Kod doğrulanamadı' }, { status: 200 });
    }
    // Kullanıcıya 2FA secret ve backup code ekle
    await runQuery(
      'UPDATE users SET twofa_secret = ?, twofa_backup_code = ? WHERE username = ?',
      [secret, backupCode, username]
    );
    return NextResponse.json({ valid: true, message: '2FA secret ve yedek kod kaydedildi' });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
