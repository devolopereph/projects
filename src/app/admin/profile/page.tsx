'use client';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import TwoFASetup from './2fa-setup';
import { toast } from 'react-hot-toast';
import { User, Lock, Globe, Shield } from 'lucide-react';
import { useAuthGuard } from '@/lib/useAuthGuard';

interface ProfileData {
  username: string;
  twofa_secret?: string | null;
  twofa_enabled_for_login?: boolean;
}

export default function AdminProfile() {
  const { session } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twofaCode: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        toast.error('Profil bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Profil bilgileri yüklenemedi');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwords.currentPassword) {
      toast.error('Mevcut şifrenizi girmelisiniz');
      return;
    }

    // 2FA varsa 2FA kodu da gerekli
    if (profileData.twofa_secret && !passwords.twofaCode) {
      toast.error('2FA kodunuzu girmelisiniz');
      return;
    }

    // Yeni şifre girilmişse doğrulama yap
    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error('Yeni şifreler eşleşmiyor');
        return;
      }

      if (passwords.newPassword.length < 6) {
        toast.error('Yeni şifre en az 6 karakter olmalıdır');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword || undefined,
          twofaCode: passwords.twofaCode || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Form alanlarını temizle
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twofaCode: ''
        });
        
        // Şifre değişmişse tüm oturumları sonlandır
        if (passwords.newPassword) {
          toast.success('Şifre başarıyla güncellendi. Tüm oturumlar sonlandırılacak.');
          
          // Diğer oturumları sonlandırmak için bir API çağrısı yapalım
          try {
            await fetch('/api/admin/profile/invalidate-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            console.error('Session invalidation error:', error);
          }
          
          // Mevcut oturumu sonlandır
          setTimeout(() => {
            signOut({ 
              callbackUrl: '/admin/login',
              redirect: true 
            });
          }, 2000);
        } else {
          toast.success('Profil başarıyla güncellendi.');
          // Sadece kullanıcı adı değişmişse sayfayı yenile
          await fetchProfile();
        }
      } else {
        toast.error(data.error || 'Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profil Ayarları</h1>
          <p className="text-muted-foreground">
            Kullanıcı adınızı ve şifrenizi yönetin
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* 2FA Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                2FA Kurulumu
              </CardTitle>
              <CardDescription>Hesabınızı ek güvenlik ile koruyun.</CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFASetup 
                username={profileData.username} 
                twofaSecret={profileData.twofa_secret} 
                on2faChange={async () => {
                  // 2FA durumu değiştiğinde profil verilerini yeniden yükle
                  try {
                    const response = await fetch('/api/admin/profile');
                    if (response.ok) {
                      const data = await response.json();
                      setProfileData(data);
                    }
                  } catch (error) {
                    console.error('Profile reload error:', error);
                  }
                }} 
              />
              
              {/* 2FA Login Toggle */}
              {profileData.twofa_secret && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">2FA ile Giriş</Label>
                      <p className="text-sm text-muted-foreground">
                        Giriş yaparken 2FA kodu zorunlu olsun
                      </p>
                    </div>
                    <Switch
                      checked={!!profileData.twofa_enabled_for_login}
                      onCheckedChange={async (checked: boolean) => {
                        // 2FA kodu doğrulaması iste
                        const twofaCode = prompt('2FA login ayarını değiştirmek için 6 haneli 2FA kodunuzu girin:');
                        if (!twofaCode) return;
                        
                        // 6 haneli sınırlaması
                        if (twofaCode.length !== 6 || !/^\d{6}$/.test(twofaCode)) {
                          toast.error('2FA kodu 6 haneli sayı olmalıdır');
                          return;
                        }

                        try {
                          const response = await fetch('/api/admin/profile/2fa-login', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              enabled: checked,
                              twofaCode: twofaCode
                            }),
                          });
                          
                          const result = await response.json();
                          
                          if (response.ok) {
                            setProfileData(prev => ({ ...prev, twofa_enabled_for_login: checked }));
                            toast.success(checked ? '2FA giriş aktif edildi' : '2FA giriş pasif edildi');
                          } else {
                            toast.error(result.error || 'Ayar güncellenirken hata oluştu');
                          }
                        } catch (error) {
                          console.error('2FA login toggle error:', error);
                          toast.error('Ayar güncellenirken hata oluştu');
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgileri
              </CardTitle>
              <CardDescription>
                Temel profil bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Dil tercihi kaldırıldı */}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Şifre Değiştir
                  </h4>
                  {/* 2FA yoksa uyarı kutusu */}
                  {!profileData.twofa_secret && (
                    <div className="mb-4 px-4 py-3 rounded-xl border border-yellow-400 bg-yellow-50 dark:bg-zinc-900/80 flex items-center gap-3 shadow-lg backdrop-blur">
                      <Lock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-900 dark:text-yellow-200 text-base">Ek güvenlik için Authenticator kurmanız önerilir.</span>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mevcut Şifre *</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                        disabled={isLoading}
                        placeholder="Değişiklik yapmak için mevcut şifrenizi girin"
                        maxLength={128}
                      />
                    </div>
                    
                    {/* 2FA varsa 2FA kodu da iste */}
                    {profileData.twofa_secret && (
                      <div className="space-y-2">
                        <Label htmlFor="twofaCode">2FA Kodu *</Label>
                        <Input
                          id="twofaCode"
                          type="text"
                          value={passwords.twofaCode}
                          onChange={(e) => setPasswords(prev => ({ ...prev, twofaCode: e.target.value }))}
                          required
                          disabled={isLoading}
                          placeholder="Google Authenticator kodunu girin"
                          maxLength={6}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Yeni Şifre (İsteğe Bağlı)</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                        disabled={isLoading}
                        placeholder="Sadece şifre değiştirilecekse girin"
                        minLength={6}
                        maxLength={128}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isLoading}
                        placeholder="Yeni şifrenizi tekrar girin"
                        maxLength={128}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Güncelleniyor...' : 'Profili Güncelle'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Oturum Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktif Kullanıcı:</span>
                  <span className="font-medium">{session?.user?.username || 'N/A'}</span>
                </div>
                {/* Dil tercihi kaldırıldı */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}