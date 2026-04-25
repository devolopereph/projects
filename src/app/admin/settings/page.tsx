'use client';

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Upload, X, Download, FileUp, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useAuthGuard } from '@/lib/useAuthGuard';

interface Settings {
  cafe_name_tr: string;
  cafe_name_en: string;
  cafe_name_ar: string;
  cafe_description_tr: string;
  cafe_description_en: string;
  cafe_description_ar: string;
  cafe_address_tr: string;
  cafe_address_en: string;
  cafe_address_ar: string;
  cafe_phone: string;
  cafe_email: string;
  cafe_website: string;
  cafe_logo_url: string;
  working_hours_tr: string;
  working_hours_en: string;
  working_hours_ar: string;
}

export default function SettingsPage() {
  const [twofaSecret, setTwofaSecret] = useState<string | null>(null);

  useEffect(() => {
    // Kullanıcı 2FA durumunu al
    const fetchTwofaStatus = async () => {
      try {
        const res = await fetch('/api/admin/settings/2fa-status');
        if (res.ok) {
          const data = await res.json();
          setTwofaSecret(data.twofa_secret);
        } else {
          // 401 veya diğer hatalar durumunda null set et
          setTwofaSecret(null);
        }
      } catch (error) {
        console.error('2FA status fetch error:', error);
        setTwofaSecret(null);
      }
    };
    fetchTwofaStatus();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>({
    cafe_name_tr: '',
    cafe_name_en: '',
    cafe_name_ar: '',
    cafe_description_tr: '',
    cafe_description_en: '',
    cafe_description_ar: '',
    cafe_address_tr: '',
    cafe_address_en: '',
    cafe_address_ar: '',
    cafe_phone: '',
    cafe_email: '',
    cafe_website: '',
    cafe_logo_url: '',
    working_hours_tr: '',
    working_hours_en: '',
    working_hours_ar: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  
  useAuthGuard();

  // Şifre doğrulama
  const isPasswordValid = passwordChecked && !!backupPassword;

  useEffect(() => {
    fetchSettings();
    checkExistingSession();
  }, []);

  // Mevcut session'ı kontrol et
  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/admin/settings/2fa-session');
      if (res.ok) {
        const data = await res.json();
        if (data.hasValidSession) {
          setPasswordChecked(true);
          // Session süresini hesapla (5 dakika)
          const expiry = new Date(Date.now() + 5 * 60 * 1000);
          setSessionExpiry(expiry);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      // Ensure all fields have default values to prevent undefined values
      const settingsWithDefaults = {
        cafe_name_tr: data.cafe_name_tr || '',
        cafe_name_en: data.cafe_name_en || '',
        cafe_name_ar: data.cafe_name_ar || '',
        cafe_description_tr: data.cafe_description_tr || '',
        cafe_description_en: data.cafe_description_en || '',
        cafe_description_ar: data.cafe_description_ar || '',
        cafe_address_tr: data.cafe_address_tr || '',
        cafe_address_en: data.cafe_address_en || '',
        cafe_address_ar: data.cafe_address_ar || '',
        cafe_phone: data.cafe_phone || '',
        cafe_email: data.cafe_email || '',
        cafe_website: data.cafe_website || '',
        cafe_logo_url: data.cafe_logo_url || '',
        working_hours_tr: data.working_hours_tr || '',
        working_hours_en: data.working_hours_en || '',
        working_hours_ar: data.working_hours_ar || '',
      };
      
      setSettings(settingsWithDefaults);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Ayarlar başarıyla kaydedildi');
      } else {
        toast.error('Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleInputChange('cafe_logo_url', data.imageUrl);
        toast.success('Logo başarıyla yüklendi');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Logo yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    handleInputChange('cafe_logo_url', '');
    toast.success('Logo kaldırıldı');
  };

  // Şifre kontrol fonksiyonu
  const handleCheckPassword = async () => {
    if (!backupPassword) {
      toast.error('Lütfen kod girin');
      return;
    }
    setIsCheckingPassword(true);
    try {
      // Önce mevcut session kontrolü
      const sessionRes = await fetch('/api/admin/settings/2fa-session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.hasValidSession) {
          setPasswordChecked(true);
          const expiry = new Date(Date.now() + 5 * 60 * 1000);
          setSessionExpiry(expiry);
          toast.success('Aktif session bulundu! İşlemler zaten aktif.');
          setIsCheckingPassword(false);
          return;
        }
      }

      // Session yoksa 2FA kodu ile yeni session oluştur
      const res = await fetch('/api/admin/settings/2fa-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: backupPassword })
      });
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setPasswordChecked(true);
        const expiry = new Date(Date.now() + (data.expiresIn || 5 * 60 * 1000));
        setSessionExpiry(expiry);
        
        if (data.sessionCreated) {
          toast.success('Kod doğrulandı! 5 dakika boyunca işlemler aktif.');
        } else {
          toast.success('Aktif session bulundu! İşlemler zaten aktif.');
        }
      } else {
        setPasswordChecked(false);
        setSessionExpiry(null);
        toast.error(data.error || 'Kod geçersiz veya süresi doldu!');
      }
    } catch (error) {
      console.error('Password check error:', error);
      setPasswordChecked(false);
      toast.error('Doğrulama sırasında hata oluştu');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  // Session timer
  useEffect(() => {
    if (!sessionExpiry) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= sessionExpiry) {
        setPasswordChecked(false);
        setSessionExpiry(null);
        toast.error('Session süresi doldu. Tekrar 2FA kodu girin.');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionExpiry]);

  // Kalan süreyi hesapla
  const getRemainingTime = () => {
    if (!sessionExpiry) return null;
    const now = new Date();
    const remaining = sessionExpiry.getTime() - now.getTime();
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Şifre değiştiğinde kontrol durumunu sıfırla
  const handlePasswordChange = (value: string) => {
    setBackupPassword(value);
    // Session varken input değişse bile butonlar aktif kalmalı
    // Sadece session yoksa passwordChecked'i false yap
    if (!sessionExpiry || (sessionExpiry && new Date() >= sessionExpiry)) {
      setPasswordChecked(false);
    }
  };

  // Yedek sistemi fonksiyonları
  const handleExportBackup = async () => {
    // Session kontrolü yap
    if (!passwordChecked || !sessionExpiry || new Date() >= sessionExpiry) {
      toast.error('Session süresi doldu. Lütfen tekrar 2FA kodu girin.');
      setPasswordChecked(false);
      setSessionExpiry(null);
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          includeImages,
          sessionBased: true
        }),
      });

      if (response.ok) {
        if (includeImages) {
          // ZIP dosyasını indir
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-cafe-backup-${new Date().toISOString().split('T')[0]}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Yedek (görseller dahil) başarıyla oluşturuldu ve indirildi');
        } else {
          // JSON dosyasını indir
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-cafe-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Yedek başarıyla oluşturuldu ve indirildi');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Yedek oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Session kontrolü yap
    if (!passwordChecked || !sessionExpiry || new Date() >= sessionExpiry) {
      toast.error('Session süresi doldu. Lütfen tekrar 2FA kodu girin.');
      setPasswordChecked(false);
      setSessionExpiry(null);
      return;
    }

    const isJsonFile = file.name.endsWith('.json');
    const isZipFile = file.name.endsWith('.zip');

    if (!isJsonFile && !isZipFile) {
      toast.error('Sadece JSON veya ZIP dosyaları kabul edilir');
      return;
    }

    setIsImporting(true);
    try {
      if (isJsonFile) {
        // JSON dosyası - mevcut yöntem
        const fileContent = await file.text();
        const backupData = JSON.parse(fileContent);

        const response = await fetch('/api/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'import',
            sessionBased: true,
            data: backupData
          }),
        });

        if (response.ok) {
          toast.success('JSON yedek başarıyla geri yüklendi');
          window.location.reload();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'JSON yedek geri yüklenirken hata oluştu');
        }
      } else if (isZipFile) {
        // ZIP dosyası - yeni yöntem
        const formData = new FormData();
        formData.append('zipFile', file);
        formData.append('sessionBased', 'true');

        const response = await fetch('/api/backup/import-zip', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast.success('ZIP yedek başarıyla geri yüklendi (görseller dahil)');
          window.location.reload();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'ZIP yedek geri yüklenirken hata oluştu');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Dosya okunamadı veya geçersiz format');
    } finally {
      setIsImporting(false);
      if (backupFileInputRef.current) {
        backupFileInputRef.current.value = '';
      }
    }
  };

  const handleClearAllData = async () => {
    // Session kontrolü yap
    if (!passwordChecked || !sessionExpiry || new Date() >= sessionExpiry) {
      toast.error('Session süresi doldu. Lütfen tekrar 2FA kodu girin.');
      setPasswordChecked(false);
      setSessionExpiry(null);
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/settings/clear-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Session varsa token gönderme, session kontrolü yeterli
          sessionBased: true
        }),
      });

      if (response.ok) {
        toast.success('Menü verileri başarıyla temizlendi');
        setShowClearConfirm(false);
        // Sayfayı yenile
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Menü verileri temizlenirken hata oluştu');
      }
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
          <p className="text-muted-foreground">
            Cafe bilgilerini ve genel ayarları yönetin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cafe Bilgileri</CardTitle>
              <CardDescription>
                Cafe adı ve açıklaması (çoklu dil desteği)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_name_tr">Cafe Adı (Türkçe)</Label>
                  <Input
                    id="cafe_name_tr"
                    value={settings.cafe_name_tr || ''}
                    onChange={(e) => handleInputChange('cafe_name_tr', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_name_en">Cafe Adı (İngilizce)</Label>
                  <Input
                    id="cafe_name_en"
                    value={settings.cafe_name_en || ''}
                    onChange={(e) => handleInputChange('cafe_name_en', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_name_ar">Cafe Adı (Arapça)</Label>
                  <Input
                    id="cafe_name_ar"
                    value={settings.cafe_name_ar || ''}
                    onChange={(e) => handleInputChange('cafe_name_ar', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_description_tr">Açıklama (Türkçe)</Label>
                  <Textarea
                    id="cafe_description_tr"
                    value={settings.cafe_description_tr || ''}
                    onChange={(e) => handleInputChange('cafe_description_tr', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_description_en">Açıklama (İngilizce)</Label>
                  <Textarea
                    id="cafe_description_en"
                    value={settings.cafe_description_en || ''}
                    onChange={(e) => handleInputChange('cafe_description_en', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_description_ar">Açıklama (Arapça)</Label>
                  <Textarea
                    id="cafe_description_ar"
                    value={settings.cafe_description_ar || ''}
                    onChange={(e) => handleInputChange('cafe_description_ar', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>
                Adres, telefon ve diğer iletişim bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_address_tr">Adres (Türkçe)</Label>
                  <Textarea
                    id="cafe_address_tr"
                    value={settings.cafe_address_tr || ''}
                    onChange={(e) => handleInputChange('cafe_address_tr', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_address_en">Adres (İngilizce)</Label>
                  <Textarea
                    id="cafe_address_en"
                    value={settings.cafe_address_en || ''}
                    onChange={(e) => handleInputChange('cafe_address_en', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_address_ar">Adres (Arapça)</Label>
                  <Textarea
                    id="cafe_address_ar"
                    value={settings.cafe_address_ar || ''}
                    onChange={(e) => handleInputChange('cafe_address_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_phone">Telefon</Label>
                  <Input
                    id="cafe_phone"
                    value={settings.cafe_phone || ''}
                    onChange={(e) => handleInputChange('cafe_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_email">E-posta</Label>
                  <Input
                    id="cafe_email"
                    type="email"
                    value={settings.cafe_email || ''}
                    onChange={(e) => handleInputChange('cafe_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafe_website">Website</Label>
                  <Input
                    id="cafe_website"
                    value={settings.cafe_website || ''}
                    onChange={(e) => handleInputChange('cafe_website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görsel ve Çalışma Saatleri</CardTitle>
              <CardDescription>
                Logo ve çalışma saatleri bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cafe Logo</Label>
                <div className="flex items-center space-x-4">
                  {settings.cafe_logo_url ? (
                    <div className="relative">
                      <Image
                        src={settings.cafe_logo_url}
                        alt="Cafe Logo"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Yükleniyor...' : 'Logo Yükle'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG veya JPEG formatında, maksimum 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="working_hours_tr">Çalışma Saatleri (Türkçe)</Label>
                  <Textarea
                    id="working_hours_tr"
                    value={settings.working_hours_tr || ''}
                    onChange={(e) => handleInputChange('working_hours_tr', e.target.value)}
                    placeholder="Pazartesi - Pazar: 08:00 - 22:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours_en">Çalışma Saatleri (İngilizce)</Label>
                  <Textarea
                    id="working_hours_en"
                    value={settings.working_hours_en || ''}
                    onChange={(e) => handleInputChange('working_hours_en', e.target.value)}
                    placeholder="Monday - Sunday: 08:00 - 22:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours_ar">Çalışma Saatleri (Arapça)</Label>
                  <Textarea
                    id="working_hours_ar"
                    value={settings.working_hours_ar || ''}
                    onChange={(e) => handleInputChange('working_hours_ar', e.target.value)}
                    placeholder="الاثنين - الأحد: 08:00 - 22:00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Veri Yönetim Sistemi
              </CardTitle>
              <CardDescription>
                Menü verilerinizi yedekleyin, geri yükleyin veya menü verilerini temizleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Şifre Girişi */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup_password">Sistem Şifresi</Label>
                  {/* 2FA yoksa uyarı kutusu */}
                  {!twofaSecret && (
                    <div className="mb-4 px-4 py-3 rounded-xl border border-yellow-400 bg-yellow-50 dark:bg-zinc-900/80 flex items-center gap-3 shadow-lg backdrop-blur">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-900 dark:text-yellow-200 text-base">Ek güvenlik için Authenticator kurmanız önerilir.</span>
                    </div>
                  )}
                  {twofaSecret ? (
                    <div className="flex gap-2 max-w-md">
                      <Input
                        id="backup_password"
                        type="text"
                        value={backupPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Google Authenticator kodunu girin..."
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheckPassword}
                        disabled={!backupPassword || isCheckingPassword}
                        className="whitespace-nowrap"
                      >
                        {isCheckingPassword ? 'Kontrol Ediliyor...' : 'Kodu Kontrol Et'}
                      </Button>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {twofaSecret ? 'Veri işlemleri için 2FA kodu gereklidir' : 'Authenticator kurarak veri işlemlerini aktif edebilirsiniz.'}
                  </p>
                  {passwordChecked && isPasswordValid && (
                    <div className="space-y-1">
                      <p className="text-xs text-green-600 font-medium">
                        ✓ 2FA kodu doğrulandı - İşlemler aktif
                      </p>
                      {sessionExpiry && getRemainingTime() && (
                        <p className="text-xs text-blue-600 font-medium">
                          🕒 Session süresi: {getRemainingTime()} kaldı
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Export/Import Butonları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Yedek Oluştur</h4>
                  <p className="text-sm text-muted-foreground">
                    Tüm menü verilerinizi indirin
                  </p>
                  
                  {/* Görsel dahil etme seçeneği */}
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:border-primary/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-gray-700 dark:hover:border-primary/60">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="includeImages"
                        checked={includeImages}
                        onCheckedChange={(checked) => setIncludeImages(!!checked)}
                        className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500"
                      />
                      <Label 
                        htmlFor="includeImages" 
                        className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        📷 Ürün görsellerini dahil et
                      </Label>
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${
                        includeImages 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {includeImages ? 'ZIP Format' : 'JSON Format'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    {includeImages 
                      ? '📦 Zip dosyası olarak indirilir (veriler + görseller)' 
                      : '📄 Sadece JSON verisi olarak indirilir (hızlı ve küçük)'
                    }
                  </p>
                  
                  <Button
                    type="button"
                    variant={isPasswordValid ? "default" : "outline"}
                    onClick={isPasswordValid ? handleExportBackup : undefined}
                    disabled={isExporting || !isPasswordValid}
                    className={`w-full transition-all duration-200 ${
                      isPasswordValid
                        ? 'hover:bg-gray-50 border-gray-300 text-gray-900 cursor-pointer' 
                        : 'bg-transparent border-gray-300 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Yedek Oluşturuluyor...' : `Yedek İndir ${includeImages ? '(ZIP)' : '(JSON)'}`}
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Yedek Geri Yükle</h4>
                  <p className="text-sm text-muted-foreground">
                    JSON veya ZIP yedek dosyasını geri yükleyin (ZIP: görseller dahil)
                  </p>
                  <Button
                    type="button"
                    variant={isPasswordValid ? "default" : "outline"}
                    onClick={isPasswordValid ? () => backupFileInputRef.current?.click() : undefined}
                    disabled={isImporting || !isPasswordValid}
                    className={`w-full transition-all duration-200 ${
                      isPasswordValid 
                        ? 'hover:bg-gray-50 border-gray-300 text-gray-900 cursor-pointer' 
                        : 'bg-transparent border-gray-300 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    {isImporting ? 'Geri Yükleniyor...' : 'Yedek Yükle'}
                  </Button>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json,.zip"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tehlikeli İşlemler */}
              <div className="border-t pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <h4 className="font-medium">Tehlikeli İşlemler</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bu işlem geri alınamaz. Tüm menü verileri (kategoriler, ürünler) ve ürün fotoğrafları kalıcı olarak silinecektir. Site ayarları ve logo korunacaktır.
                  </p>
                  
                  {!showClearConfirm ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowClearConfirm(true)}
                      disabled={!isPasswordValid}
                      className={`w-full md:w-auto transition-all duration-200 ${
                        !isPasswordValid 
                          ? 'bg-transparent border-gray-300 text-gray-400 opacity-50 cursor-not-allowed' 
                          : 'hover:bg-red-700 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Menü Verilerini Temizle
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 border border-destructive rounded-lg bg-destructive/5">
                      <p className="text-sm font-medium text-destructive">
                        ⚠️ Bu işlem geri alınamaz! Tüm menü verileri ve ürün fotoğrafları silinecektir.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kategoriler, ürünler ve ürün fotoğrafları silinecek. Site ayarları ve logo korunacak. Devam etmek istediğinizden emin misiniz?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleClearAllData}
                          disabled={isClearing}
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isClearing ? 'Temizleniyor...' : 'Evet, Menü Verilerini Sil'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowClearConfirm(false)}
                          size="sm"
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
