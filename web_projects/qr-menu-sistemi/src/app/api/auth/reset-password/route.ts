import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'menu.db');

export async function POST(request: NextRequest) {
  try {
    const { username, backupCode, newPassword, removeTwoFA } = await request.json();

    if (!username || !backupCode || !newPassword) {
      return NextResponse.json(
        { message: 'Kullanıcı adı, yedek kod ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { message: 'Şifre en fazla 128 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    try {
      // Kullanıcıyı ve yedek kodunu kontrol et
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
        username: string;
        password_hash: string;
        twofa_backup_code?: string;
        twofa_secret?: string;
        twofa_enabled_for_login?: number;
      } | undefined;
      
      if (!user) {
        return NextResponse.json(
          { message: 'Kullanıcı bulunamadı' },
          { status: 404 }
        );
      }

      if (!user.twofa_secret) {
        return NextResponse.json(
          { message: '2FA kurulmamış. Şifre sıfırlama sadece 2FA aktif hesaplar için kullanılabilir.' },
          { status: 400 }
        );
      }

      if (!user.twofa_backup_code) {
        return NextResponse.json(
          { message: 'Yedek kod bulunamadı. Lütfen yönetici ile iletişime geçin.' },
          { status: 400 }
        );
      }

      // Yedek kodu kontrol et
      if (user.twofa_backup_code !== backupCode) {
        return NextResponse.json(
          { message: 'Geçersiz yedek kod' },
          { status: 401 }
        );
      }

      // Yeni şifreyi hashle
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Şifreyi güncelle ve isteğe bağlı olarak 2FA'yı kaldır
      if (removeTwoFA) {
        const updateStmt = db.prepare('UPDATE users SET password_hash = ?, twofa_secret = NULL, twofa_backup_code = NULL, twofa_enabled_for_login = false WHERE username = ?');
        updateStmt.run(hashedPassword, username);
      } else {
        const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
        updateStmt.run(hashedPassword, username);
      }

      return NextResponse.json(
        { 
          message: removeTwoFA ? 'Şifre başarıyla sıfırlandı ve 2FA kaldırıldı' : 'Şifre başarıyla sıfırlandı',
          removedTwoFA: !!removeTwoFA
        },
        { status: 200 }
      );

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
