'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Eye, RotateCcw } from 'lucide-react';

interface AnalyticsData {
  period: string;
  totalVisits: number;
  uniqueSessions: number;
  activeSessions: number;
  totalProductViews: number;
  topProducts: Array<{
    name_tr: string;
    name_en: string;
    name_ar: string;
    views: number;
  }>;
  topCategories: Array<{
    name_tr: string;
    name_en: string;
    name_ar: string;
    views: number;
  }>;
  dailyStats: Array<{
    date: string;
    visits: number;
    product_views: number;
    unique_sessions: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Token kontrolü için admin API çağrısı
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetch('/api/admin/auth-check');
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, fetchAnalytics]);

  const handleResetAnalytics = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh analytics data after reset
        await fetchAnalytics();
        setShowResetDialog(false);
        alert('Tüm istatistikler başarıyla sıfırlandı!');
      } else {
        const error = await response.json();
        alert('Hata: ' + (error.error || 'İstatistikler sıfırlanırken hata oluştu'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('İstatistikler sıfırlanırken hata oluştu');
    } finally {
      setIsResetting(false);
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

  if (!analytics) {
    return null;
  }

  const periodLabels = {
    today: 'Bugün',
    week: 'Bu Hafta',
    month: 'Bu Ay',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">İstatistikler</h2>
            <p className="text-muted-foreground">
              Ziyaretçi ve ürün görüntüleme istatistikleri
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  İstatistikleri Sıfırla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                   <DialogTitle>İstatistikleri Sıfırla</DialogTitle>
                   <DialogDescription>
                     Bu işlem tüm istatistik verilerini kalıcı olarak silecektir. Bu işlem geri alınamaz.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4">
                   <div>
                     <p className="text-sm text-muted-foreground mb-2">Silinecek veriler:</p>
                     <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                       <li>Tüm ziyaretçi kayıtları</li>
                       <li>Ürün görüntüleme istatistikleri</li>
                       <li>Kategori görüntüleme istatistikleri</li>
                       <li>Günlük istatistik verileri</li>
                     </ul>
                   </div>
                   <p className="text-sm text-muted-foreground font-medium">
                     Emin misiniz?
                   </p>
                 </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResetDialog(false)}
                    disabled={isResetting}
                  >
                    İptal
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleResetAnalytics}
                    disabled={isResetting}
                  >
                    {isResetting ? 'Sıfırlanıyor...' : 'Evet, Sıfırla'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <div className="w-48">
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="today">Bugün</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Ziyaret
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                {periodLabels[selectedPeriod as keyof typeof periodLabels]} toplam ziyaret
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ürün Görüntüleme
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProductViews}</div>
              <p className="text-xs text-muted-foreground">
                {periodLabels[selectedPeriod as keyof typeof periodLabels]} ürün görüntüleme
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>En Çok Görüntülenen Kategoriler</CardTitle>
              <CardDescription>
                {periodLabels[selectedPeriod as keyof typeof periodLabels]} en popüler kategoriler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead className="text-right">Görüntüleme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topCategories.slice(0, 10).map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.name_tr}</TableCell>
                      <TableCell className="text-right">{category.views}</TableCell>
                    </TableRow>
                  ))}
                  {analytics.topCategories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Henüz veri bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>En Çok Görüntülenen Ürünler</CardTitle>
              <CardDescription>
                {periodLabels[selectedPeriod as keyof typeof periodLabels]} en popüler ürünler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead className="text-right">Görüntüleme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topProducts.slice(0, 10).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name_tr}</TableCell>
                      <TableCell className="text-right">{product.views}</TableCell>
                    </TableRow>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Henüz veri bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}