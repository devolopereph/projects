'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    twofa: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState({
    username: '',
    backupCode: '',
    newPassword: '',
    confirmPassword: '',
    removeTwoFA: false
  });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [cafeName, setCafeName] = useState('QR Cafe');
  const router = useRouter();
  const { data: session, status } = useSession();

  // Eğer kullanıcı zaten giriş yapmışsa admin paneline yönlendir
  useEffect(() => {
    if (status === 'loading') return; // Session yüklenirken bekle
    
    if (session && session.user?.username) {
      // Session geçerliliğini kontrol et
      const checkSessionValidity = async () => {
        try {
          const response = await fetch('/api/admin/auth-check');
          if (response.ok) {
            // Session geçerli, admin'e yönlendir
            router.replace('/admin');
          }
          // Session geçersizse burada kalır
        } catch {
          // Hata durumunda login sayfasında kalır
          console.log('Session check failed, staying on login page');
        }
      };
      
      checkSessionValidity();
    }
  }, [session, status, router]);

  // Fetch cafe name for dynamic branding
  useEffect(() => {
    const fetchCafeName = async () => {
      try {
        const response = await fetch('/api/settings/cafe-info');
        const data = await response.json();
        if (data.name_tr) {
          setCafeName(data.name_tr);
        }
      } catch (error) {
        console.error('Error fetching cafe name:', error);
      }
    };
    fetchCafeName();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!showTwoFA) {
        // Önce kullanıcı adı ve şifre doğruluğunu kontrol et
        const checkResponse = await fetch('/api/auth/check-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const checkResult = await checkResponse.json();

        if (!checkResponse.ok) {
          toast.error(checkResult.error || 'Kullanıcı adı veya şifre hatalı.');
          return;
        }

        if (checkResult.requires2FA) {
          // 2FA gerekli, 2FA alanını göster
          setShowTwoFA(true);
          toast('2FA kodu gerekli', { icon: 'ℹ️' });
          return;
        }

        // 2FA gerekli değil, direkt giriş yap
        const result = await signIn('credentials', {
          username: credentials.username,
          password: credentials.password,
          redirect: false,
        });

        if (result?.ok) {
          toast.success('Giriş başarılı!');
          // Session güncellenene kadar bekle ve sonra yönlendir
          window.location.href = '/admin';
        } else {
          toast.error('Giriş başarısız');
        }
      } else {
        // 2FA kodu ile giriş yap
        const result = await signIn('credentials', {
          username: credentials.username,
          password: credentials.password,
          twofa: credentials.twofa,
          redirect: false,
        });

        if (result?.ok) {
          toast.success('Giriş başarılı!');
          // Session güncellenene kadar bekle ve sonra yönlendir
          window.location.href = '/admin';
        } else {
          // 2FA kodu ile giriş başarısız - muhtemelen geçersiz 2FA kodu
          toast.error('Geçersiz 2FA kodu');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);

    try {
      // Şifre sıfırlama işlemi
      if (forgotPassword.newPassword !== forgotPassword.confirmPassword) {
        toast.error('Şifreler eşleşmiyor');
        return;
      }

      if (forgotPassword.newPassword.length < 6) {
        toast.error('Şifre en az 6 karakter olmalıdır');
        return;
      }

      // Burada API çağrısı yapılacak
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: forgotPassword.username,
          backupCode: forgotPassword.backupCode,
          newPassword: forgotPassword.newPassword,
          removeTwoFA: forgotPassword.removeTwoFA
        }),
      });

      if (response.ok) {
        toast.success('Şifre başarıyla sıfırlandı');
        setIsForgotPasswordOpen(false);
        setForgotPassword({
          username: '',
          backupCode: '',
          newPassword: '',
          confirmPassword: '',
          removeTwoFA: false
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Şifre sıfırlama başarısız');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('Bir hata oluştu');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // Session yüklenirken loading göster
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }


  // Eğer session varsa admin paneline yönlendir (bu kod artık gerekli değil, üstteki useEffect ile hallettik)
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{cafeName} Yetkili Paneli</CardTitle>
          <CardDescription>
            Admin paneline giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => {
                  setCredentials(prev => ({ ...prev, username: e.target.value }));
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  maxLength={128}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {showTwoFA && (
              <div className="space-y-2">
                <Label htmlFor="twofa">2FA Kodu *</Label>
                <Input
                  id="twofa"
                  type="text"
                  value={credentials.twofa}
                  onChange={(e) => setCredentials(prev => ({ ...prev, twofa: e.target.value }))}
                  disabled={isLoading}
                  placeholder="6 haneli 2FA kodunu girin"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  <KeyRound className="h-4 w-4 mr-1" />
                  Şifremi Unuttum
                </Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Şifre Sıfırlama</DialogTitle>
                    <DialogDescription>
                      Yedek kodunuz ile şifrenizi sıfırlayabilirsiniz.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-username">Kullanıcı Adı</Label>
                      <Input
                        id="forgot-username"
                        type="text"
                        value={forgotPassword.username}
                        onChange={(e) => setForgotPassword(prev => ({ ...prev, username: e.target.value }))}
                        required
                        disabled={isForgotPasswordLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-code">Yedek Kod</Label>
                      <Input
                        id="backup-code"
                        type="text"
                        value={forgotPassword.backupCode}
                        onChange={(e) => {
                          // Boşlukları kaldır ve karakter limiti uygula
                          const cleanValue = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 40);
                          setForgotPassword(prev => ({ ...prev, backupCode: cleanValue }));
                        }}
                        required
                        disabled={isForgotPasswordLoading}
                        placeholder="32 karakterlik yedek kodunuzu girin (boşluksuz)"
                        maxLength={40}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Yeni Şifre</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={forgotPassword.newPassword}
                        onChange={(e) => setForgotPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        disabled={isForgotPasswordLoading}
                        minLength={6}
                        maxLength={128}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={forgotPassword.confirmPassword}
                        onChange={(e) => setForgotPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={isForgotPasswordLoading}
                        minLength={6}
                        maxLength={128}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="remove-2fa" 
                        checked={forgotPassword.removeTwoFA}
                        onCheckedChange={(checked: boolean) => setForgotPassword(prev => ({ ...prev, removeTwoFA: checked }))}
                        disabled={isForgotPasswordLoading}
                      />
                      <label 
                        htmlFor="remove-2fa" 
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        2FA ayarlarını tamamen kaldır (Yeniden kurulum gerekir)
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsForgotPasswordOpen(false)}
                        disabled={isForgotPasswordLoading}
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isForgotPasswordLoading}
                      >
                        {isForgotPasswordLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          

        </CardContent>
      </Card>
    </div>
  );
}