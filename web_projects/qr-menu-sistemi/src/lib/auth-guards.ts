import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getQuery, runQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

type AdminSession = Session & {
  user: Session['user'] & {
    username: string;
  };
};

type AuthResult =
  | { session: AdminSession }
  | { response: NextResponse };

interface ElevatedAuthOptions {
  token?: string | null;
  sessionBased?: boolean;
}

export async function requireAdminSession(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { session: session as AdminSession };
}

export async function requireElevatedAdmin(options: ElevatedAuthOptions = {}): Promise<AuthResult> {
  const auth = await requireAdminSession();
  if ('response' in auth) {
    return auth;
  }

  await ensureTwoFASessionTable();
  await cleanupExpiredTwoFASessions();

  if (options.sessionBased) {
    const validSession = await hasValidTwoFASession(auth.session.user.username);
    if (validSession) {
      return auth;
    }
  }

  const token = typeof options.token === 'string' ? options.token.trim() : '';
  if (/^\d{6}$/.test(token)) {
    const user = await getQuery(
      'SELECT twofa_secret FROM users WHERE username = ?',
      [auth.session.user.username]
    ) as { twofa_secret?: string | null } | null;

    if (user?.twofa_secret && verify2FACode(user.twofa_secret, token)) {
      return auth;
    }
  }

  return {
    response: NextResponse.json({ error: '2FA verification required' }, { status: 401 }),
  };
}

export async function ensureTwoFASessionTable(): Promise<void> {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS twofa_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function cleanupExpiredTwoFASessions(): Promise<void> {
  await runQuery('DELETE FROM twofa_sessions WHERE expires_at < datetime(\'now\')');
}

async function hasValidTwoFASession(username: string): Promise<boolean> {
  const session = await getQuery(
    'SELECT id FROM twofa_sessions WHERE username = ? AND expires_at > datetime(\'now\')',
    [username]
  ) as { id: number } | null;

  return !!session;
}
