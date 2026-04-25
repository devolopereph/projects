import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'menu.db');

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Kullanıcı adı gereklidir' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    try {
      // Kullanıcının 2FA durumunu kontrol et
      const user = db.prepare('SELECT twofa_secret, twofa_enabled_for_login FROM users WHERE username = ?').get(username) as {
        twofa_secret?: string;
        twofa_enabled_for_login?: number;
      } | undefined;
      
      if (!user) {
        // Güvenlik için kullanıcı bulunamadığında da false döndür
        return NextResponse.json({ has2fa: false, twofa_enabled_for_login: false });
      }

      const has2fa = !!user.twofa_secret;
      const twofaEnabledForLogin = !!user.twofa_enabled_for_login;

      return NextResponse.json({ 
        has2fa,
        twofa_enabled_for_login: twofaEnabledForLogin
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('2FA check error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}