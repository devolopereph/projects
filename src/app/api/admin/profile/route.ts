import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import bcrypt from 'bcryptjs';
import { verify2FACode } from '@/lib/2fa';
import { getQuery, runQuery } from '@/lib/db';

// Type definitions for database results
interface User {
  id: number;
  username: string;
  password_hash: string;
  twofa_secret?: string;
  twofa_enabled_for_login?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getQuery(
      'SELECT id, username, twofa_secret, twofa_enabled_for_login FROM users WHERE username = ?',
      [session.user.username]
    ) as (User & { twofa_enabled_for_login?: number }) | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      twofa_secret: user.twofa_secret || null,
      twofa_enabled_for_login: !!user.twofa_enabled_for_login
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, currentPassword, newPassword, twofaCode } = await request.json();

    // Get current user data
    const currentUser = await getQuery(
      'SELECT id, username, password_hash, twofa_secret FROM users WHERE username = ?',
      [session.user.username]
    ) as User | null;

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 });
    }

    // 2FA varsa 2FA kodunu da doğrula
    if (currentUser.twofa_secret) {
      if (!twofaCode) {
        return NextResponse.json({ error: '2FA kodu gereklidir' }, { status: 400 });
      }

      const valid = verify2FACode(currentUser.twofa_secret, twofaCode);

      if (!valid) {
        return NextResponse.json({ error: 'Geçersiz 2FA kodu' }, { status: 400 });
      }
    }

    // Check if new username already exists (if username is being changed)
    if (username !== currentUser.username) {
      const existingUser = await getQuery(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, currentUser.id]
      ) as Pick<User, 'id'> | null;

      if (existingUser) {
        return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor' }, { status: 400 });
      }
    }

    // Şifre değişikliği kontrolü
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 });
      }
      
      if (newPassword.length > 128) {
        return NextResponse.json({ error: 'Yeni şifre en fazla 128 karakter olmalıdır' }, { status: 400 });
      }
      
      // Şifre ile birlikte kullanıcı adını ve password_changed_at timestamp'ini güncelle
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await runQuery(
        'UPDATE users SET username = ?, password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, hashedPassword, currentUser.id]
      );
    } else {
      // Sadece kullanıcı adını güncelle
      await runQuery(
        'UPDATE users SET username = ? WHERE id = ?',
        [username, currentUser.id]
      );
    }

    return NextResponse.json({ 
      message: 'Profil başarıyla güncellendi',
      username: username
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
