import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getQuery } from '@/lib/db';
import { verify2FACode } from '@/lib/2fa';

interface User {
  id: number;
  username: string;
  password_hash: string;
  preferred_language: string;
  twofa_secret?: string;
  twofa_enabled_for_login?: boolean;
  password_changed_at?: string;
}

interface ExtendedUser {
  id: string;
  username: string;
  preferredLanguage: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      preferredLanguage: string;
    };
  }

  interface User extends ExtendedUser {
    // Add any additional user properties if needed
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    preferredLanguage?: string;
    passwordChangedAt?: string;
    iat?: number;
    invalidated?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        twofa: { label: '2FA Kodu', type: 'text', placeholder: '6 haneli kod' }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await getQuery(
          'SELECT * FROM users WHERE username = ?',
          [credentials.username]
        ) as User | null;

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Eğer 2FA kodu gönderilmişse, 2FA kontrolü yap
        if (credentials.twofa) {
          if (user.twofa_secret && user.twofa_enabled_for_login) {
            const twofaValid = verify2FACode(user.twofa_secret, credentials.twofa);
            
            if (!twofaValid) {
              // Geçersiz 2FA kodu - null döndür
              return null;
            }
          }
        } else {
          // 2FA kodu gönderilmemiş, ama 2FA gerekli mi kontrol et
          if (user.twofa_secret && user.twofa_enabled_for_login) {
            // 2FA gerekli ama kod gönderilmemiş - bu durumda null döndür
            // Frontend bu durumu check-credentials API'si ile handle edecek
            return null;
          }
        }

        return {
          id: user.id.toString(),
          username: user.username,
          preferredLanguage: user.preferred_language,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Yeni giriş - kullanıcı bilgilerini token'a ekle
        token.username = user.username;
        token.preferredLanguage = user.preferredLanguage;
        
        // Kullanıcının password_changed_at timestamp'ini al
        const userWithTimestamp = await getQuery(
          'SELECT password_changed_at FROM users WHERE username = ?',
          [user.username]
        ) as { password_changed_at?: string } | null;
        
        if (userWithTimestamp?.password_changed_at) {
          token.passwordChangedAt = userWithTimestamp.password_changed_at;
        }
      } else if (token.username && token.passwordChangedAt) {
        // Mevcut token - password değişikliği kontrolü
        try {
          const userWithTimestamp = await getQuery(
            'SELECT password_changed_at FROM users WHERE username = ?',
            [token.username]
          ) as { password_changed_at?: string } | null;
          
          if (userWithTimestamp?.password_changed_at) {
            const dbTimestamp = new Date(userWithTimestamp.password_changed_at).getTime();
            const tokenTimestamp = new Date(token.passwordChangedAt).getTime();
            
            // Eğer veritabanındaki timestamp token'dakinden daha yeniyse, token geçersiz
            if (dbTimestamp > tokenTimestamp) {
              // Session invalidation için özel bir işaret ekle
              token.invalidated = true;
              token.username = undefined;
              token.preferredLanguage = undefined;
              token.passwordChangedAt = undefined;
            }
          }
        } catch (error) {
          console.error('Error checking password change timestamp:', error);
          // Hata durumunda token'ı invalidate et
          token.invalidated = true;
          token.username = undefined;
          token.preferredLanguage = undefined;
          token.passwordChangedAt = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Token invalidated ise boş session döndür
      if (token.invalidated || !token.username || !token.preferredLanguage) {
        // Session'ı temizle ama null döndürme
        session.user = {
          id: '',
          username: '',
          preferredLanguage: '',
        };
        return session;
      }
      
      if (token && token.sub && token.username && token.preferredLanguage) {
        session.user = {
          id: token.sub,
          username: token.username,
          preferredLanguage: token.preferredLanguage,
        };
      }
      return session;
    },
    async signIn() {
      // Başarılı giriş eventi
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Eğer URL localhost içeriyorsa ve production ortamındaysak, baseUrl kullan
      if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
        // URL'nin path kısmını al
        const urlObj = new URL(url);
        return baseUrl + urlObj.pathname + urlObj.search;
      }
      
      // URL zaten doğru base URL ile başlıyorsa, olduğu gibi döndür
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Relative URL ise baseUrl ile birleştir
      if (url.startsWith('/')) {
        return baseUrl + url;
      }
      
      // Diğer durumlarda baseUrl döndür
      return baseUrl;
    },
  },
  events: {
    async signIn() {
      // Başarılı giriş eventi
    },
    async signOut() {
      // Çıkış eventi
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);