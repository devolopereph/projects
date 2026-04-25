import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getQuery, runQuery } from '@/lib/db';
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

// 2FA session tablosunu oluştur (eğer yoksa)
async function ensureTwoFASessionTable() {
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS twofa_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating twofa_sessions table:', error);
  }
}

// Eski session'ları temizle
async function cleanupExpiredSessions() {
  try {
    await runQuery('DELETE FROM twofa_sessions WHERE expires_at < datetime(\'now\')');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

// Kullanıcının aktif session'ını kontrol et
async function hasValidSession(username: string): Promise<boolean> {
  try {
    const session = await getQuery(
      'SELECT * FROM twofa_sessions WHERE username = ? AND expires_at > datetime("now")',
      [username]
    ) as TwoFASession | null;
    
    return !!session;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

// Yeni session oluştur
async function createSession(username: string) {
  try {
    // Önce eski session'ları sil
    await runQuery('DELETE FROM twofa_sessions WHERE username = ?', [username]);
    
    // 5 dakika sonra expire olacak yeni session oluştur
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    await runQuery(
      'INSERT INTO twofa_sessions (username, expires_at) VALUES (?, ?)',
      [username, expiresAt]
    );
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// GET: Session durumunu kontrol et
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTwoFASessionTable();
    await cleanupExpiredSessions();

    const hasSession = await hasValidSession(session.user.username);
    
    return NextResponse.json({ 
      hasValidSession: hasSession,
      sessionValid: hasSession 
    });
  } catch (error) {
    console.error('2FA session check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 2FA kodu doğrula ve session oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    
    if (!token || token.length !== 6) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    await ensureTwoFASessionTable();
    await cleanupExpiredSessions();

    // Kullanıcının aktif session'ı var mı kontrol et
    const existingSession = await getQuery(
      'SELECT * FROM twofa_sessions WHERE username = ? AND expires_at > datetime(\'now\')',
      [session.user.username]
    ) as TwoFASession | null;
    
    if (existingSession) {
      return NextResponse.json({ 
        valid: true, 
        sessionCreated: false,
        message: 'Session already active' 
      });
    }

    // 2FA secret'ı al
    const user = await getQuery(
      'SELECT twofa_secret FROM users WHERE username = ?', 
      [session.user.username]
    ) as User;
    
    const secret = user?.twofa_secret;
    
    if (!secret) {
      return NextResponse.json({ error: '2FA not configured' }, { status: 400 });
    }

    // 2FA kodunu doğrula
    const valid = verify2FACode(secret, token);
    
    if (valid) {
      // Session oluştur
      await createSession(session.user.username);
      
      return NextResponse.json({ 
        valid: true, 
        sessionCreated: true,
        expiresIn: 5 * 60 * 1000 // 5 dakika ms cinsinden
      });
    } else {
      return NextResponse.json({ 
        valid: false,
        error: 'Invalid 2FA code'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('2FA session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Session'ı sonlandır
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTwoFASessionTable();
    await runQuery('DELETE FROM twofa_sessions WHERE username = ?', [session.user.username]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA session deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}