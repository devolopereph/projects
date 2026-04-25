import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getQuery } from '@/lib/db';

interface User {
  id: number;
  username: string;
  password_hash: string;
  preferred_language: string;
  twofa_secret?: string;
  twofa_enabled_for_login?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      );
    }

    const user = await getQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    ) as User | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Kullanıcı adı ve şifre doğru
    const requires2FA = !!(user.twofa_secret && user.twofa_enabled_for_login);

    return NextResponse.json({
      success: true,
      requires2FA,
      message: requires2FA ? '2FA kodu gerekli' : 'Giriş başarılı'
    });

  } catch (error) {
    console.error('Check credentials error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
