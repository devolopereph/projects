import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

interface User {
  twofa_secret?: string | null;
}

interface TwoFASession {
  id: number;
  username: string;
  verified_at: string;
  expires_at: string;
}

// Kullanıcının aktif session'ını kontrol et
async function hasValidSession(username: string): Promise<boolean> {
  try {
    const session = await getQuery(
      'SELECT * FROM twofa_sessions WHERE username = ? AND expires_at > datetime(\'now\')',
      [username]
    ) as TwoFASession | null;
    
    return !!session;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getQuery('SELECT twofa_secret FROM users WHERE username = ?', [session.user.username]) as User;
    return NextResponse.json({ twofa_secret: user?.twofa_secret || null });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Önce aktif session var mı kontrol et
    const hasSession = await hasValidSession(session.user.username);
    if (hasSession) {
      return NextResponse.json({ 
        valid: true,
        fromSession: true,
        message: 'Valid session found'
      });
    }

    const { token } = await request.json();
    const user = await getQuery('SELECT twofa_secret FROM users WHERE username = ?', [session.user.username]) as User;
    const secret = user?.twofa_secret;
    let valid = false;
    if (secret && token && token.length === 6) {
      valid = verify2FACode(secret, token);
    }
    return NextResponse.json({ 
      valid,
      fromSession: false 
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
