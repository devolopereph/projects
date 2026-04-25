import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getQuery, runQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getQuery(
      'SELECT twofa_enabled_for_login FROM users WHERE username = ?',
      [session.user.username]
    ) as { twofa_enabled_for_login?: number } | null;

    return NextResponse.json({ 
      twofa_enabled_for_login: user?.twofa_enabled_for_login || false 
    });
  } catch (error) {
    console.error('2FA login status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled, twofaCode } = await request.json();

    // 2FA kodu kontrolü
    if (!twofaCode) {
      return NextResponse.json({ error: '2FA kodu gerekli' }, { status: 400 });
    }

    // Kullanıcının 2FA secret'ını al
    const user = await getQuery(
      'SELECT twofa_secret FROM users WHERE username = ?',
      [session.user.username]
    ) as { twofa_secret: string } | null;

    if (!user || !user.twofa_secret) {
      return NextResponse.json({ error: '2FA kurulu değil' }, { status: 400 });
    }

    // 2FA kodunu doğrula
    const isValidCode = verify2FACode(user.twofa_secret, twofaCode);
    if (!isValidCode) {
      return NextResponse.json({ error: 'Geçersiz 2FA kodu' }, { status: 400 });
    }

    // 2FA login ayarını güncelle
    await runQuery(
      'UPDATE users SET twofa_enabled_for_login = ? WHERE username = ?',
      [enabled ? 1 : 0, session.user.username]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA login toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}