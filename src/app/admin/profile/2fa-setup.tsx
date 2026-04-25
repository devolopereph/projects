import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generate2FASecret, generateQRCode } from '@/lib/2fa';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface TwoFASetupProps {
  username: string;
  twofaSecret?: string | null;
  on2faChange?: () => void;
}

export default function TwoFASetup(props: TwoFASetupProps) {
  const username = props.username;
  const twofaSecret = props.twofaSecret;
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCode, setBackupCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'done'>('setup');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteToken, setDeleteToken] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState<boolean | null>(null);
  const [backupCodeConfirmed, setBackupCodeConfirmed] = useState(false);

  const handleSetup = async () => {
    const sec = generate2FASecret(username);
    setSecret(sec.base32);
    
    // Güvenli backup kod oluştur (32 karakterlik base32)
    const backupBytes = new Uint8Array(32); // 32 byte için daha uzun kod
    crypto.getRandomValues(backupBytes);
    const backup = Array.from(backupBytes, byte => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[byte % 32]
    ).join('').substring(0, 32); // Tam 32 karakter
    setBackupCode(backup);
    
    if (sec.otpauth_url) {
      const qr = await generateQRCode(sec.otpauth_url);
      setQrCode(qr);
      setStep('verify');
    } else {
      setQrCode(null);
    }
  };

  const handleVerify = async () => {
    if (!secret || !backupCode) return;
    
    if (!token || token.length !== 6) {
      setError('6 haneli doğrulama kodunu giriniz');
      return;
    }

    if (!backupCodeConfirmed) {
      setError('Yedek kodları kaydettiğinizi onaylamalısınız');
      return;
    }

    // Kod doğrulamasını backend'e gönder
    const res = await fetch('/api/admin/profile/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, secret, token, backupCode })
    });
    const data = await res.json();
    if (res.ok && data.valid) {
      setStep('done');
      setError('');
      // 2FA kurulumu tamamlandığında profil verilerini yenile
      props.on2faChange?.();
    } else {
      setError(data.error || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteSuccess(null);
    try {
      const res = await fetch('/api/admin/profile/2fa/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token: deleteToken })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDeleteSuccess(true);
        setShowDelete(false);
        setStep('setup');
        toast.success('2FA başarıyla kaldırıldı!');
        props.on2faChange?.();
      } else {
        setDeleteSuccess(false);
        setDeleteError(data.error || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
        toast.error(data.error || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('2FA silme fetch hatası:', err);
      setDeleteError('İstek gönderilemedi. Sunucuya ulaşılamıyor.');
      toast.error('İstek gönderilemedi. Sunucuya ulaşılamıyor.');
    }
  };

  return (
    <div className="space-y-6">
      {step === 'setup' && !twofaSecret && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              2FA Güvenlik Kurulumu
            </CardTitle>
            <CardDescription>
              Hesabınızı ek güvenlik katmanı ile koruyun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSetup} className="w-full">
              2FA Kurulumunu Başlat
            </Button>
          </CardContent>
        </Card>
      )}
      
      {step === 'verify' && qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              2FA Kurulumu - Doğrulama
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                1. Google Authenticator uygulaması ile QR kodu okutun:
              </p>
              <div className="flex justify-center">
                <Image src={qrCode} alt="2FA QR Code" className="border rounded-lg" width={200} height={200} />
              </div>
            </div>
            
            {/* Yedek Kod Uyarısı */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  ÖNEMLİ: Yedek Kodunuz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 flex flex-col items-center gap-2">
                  <p className="text-center font-mono text-sm font-bold text-amber-900 dark:text-amber-100 break-all">
                    {backupCode ? backupCode.match(/.{1,4}/g)?.join(' ') : ''}
                  </p>
                  {backupCode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 cursor-pointer hover:cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(backupCode);
                          toast.success('Yedek kod panoya kopyalandı!');
                        } catch {
                          toast.error('Kopyalama başarısız!');
                        }
                      }}
                    >
                      Kopyala
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ Bu yedek kodu mutlaka güvenli bir yere kaydedin!
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4">
                    <li>• Telefonunuzu kaybederseniz bu kod ile giriş yapabilirsiniz</li>
                    <li>• Bu kodu kaybederseniz admin paneline giriş yapamayabilirsiniz</li>
                    <li>• Kodu ekran görüntüsü alarak veya not ederek saklayın</li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="backup-confirmed" 
                    checked={backupCodeConfirmed}
                    onCheckedChange={(checked: boolean) => setBackupCodeConfirmed(checked)}
                  />
                  <label 
                    htmlFor="backup-confirmed" 
                    className="text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer"
                  >
                    Yedek kodu güvenli bir yere kaydettim ve anladım
                  </label>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  2. Authenticator uygulamasındaki 6 haneli kodu girin:
                </label>
                <Input
                  type="text"
                  placeholder="6 haneli kodu girin"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && backupCodeConfirmed && token.length === 6) {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  maxLength={6}
                  disabled={!backupCodeConfirmed}
                  className={!backupCodeConfirmed ? 'opacity-50' : ''}
                />
              </div>
              
              <Button 
                className="w-full cursor-pointer hover:cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={handleVerify}
                disabled={!backupCodeConfirmed || token.length !== 6}
              >
                {!backupCodeConfirmed ? 'Önce yedek kodu onaylayın' : 'Kurulumu Tamamla'}
              </Button>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {step === 'done' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">2FA kurulumu başarıyla tamamlandı!</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 2FA Silme Bölümü */}
      <div className="space-y-4">
        {deleteSuccess === true ? (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">2FA başarıyla kaldırıldı!</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          !showDelete && twofaSecret && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">2FA&apos;yı Kaldır</CardTitle>
                <CardDescription>
                  2FA korumasını kaldırmak hesabınızı daha az güvenli hale getirir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setShowDelete(true)}>
                  2FA&apos;yı Kaldır
                </Button>
              </CardContent>
            </Card>
          )
        )}
        
        {showDelete && deleteSuccess !== true && twofaSecret && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">2FA Kaldırma Onayı</CardTitle>
              <CardDescription>
                İşlemi onaylamak için 2FA kodunuzu girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="2FA kodunu girin"
                value={deleteToken}
                onChange={e => setDeleteToken(e.target.value)}
                maxLength={6}
              />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete}>
                  2FA&apos;yı Sil
                </Button>
                <Button variant="outline" onClick={() => setShowDelete(false)}>
                  İptal
                </Button>
              </div>
              {deleteError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {deleteError}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
