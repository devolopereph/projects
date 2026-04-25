'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Package, FolderOpen, Users, TrendingUp, Eye } from 'lucide-react';

interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  todayVisits: number;
  todayProductViews: number;
  weeklyVisits: number;
  monthlyVisits: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalProducts: 0,
    todayVisits: 0,
    todayProductViews: 0,
    weeklyVisits: 0,
    monthlyVisits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cafeName, setCafeName] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

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

  const fetchStats = async () => {
    try {
      // Fetch categories count
      const categoriesRes = await fetch('/api/categories');
      const categories = await categoriesRes.json();

      // Fetch products count
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();

      // Fetch analytics
      const [todayRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch('/api/analytics?period=today'),
        fetch('/api/analytics?period=week'),
        fetch('/api/analytics?period=month'),
      ]);

      const [todayData, weeklyData, monthlyData] = await Promise.all([
        todayRes.json(),
        weeklyRes.json(),
        monthlyRes.json(),
      ]);

      setStats({
        totalCategories: categories.length || 0,
        totalProducts: products.length || 0,
        todayVisits: todayData.totalVisits || 0,
        todayProductViews: todayData.totalProductViews || 0,
        weeklyVisits: weeklyData.totalVisits || 0,
        monthlyVisits: monthlyData.totalVisits || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
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

  const statCards = [
    {
      title: 'Toplam Kategori',
      value: stats.totalCategories,
      icon: FolderOpen,
      description: 'Aktif kategori sayısı',
    },
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      description: 'Menüdeki ürün sayısı',
    },
    {
      title: 'Bugünkü Ziyaret',
      value: stats.todayVisits,
      icon: Users,
      description: 'Bugün siteyi ziyaret eden',
    },
    {
      title: 'Bugünkü Ürün Görüntüleme',
      value: stats.todayProductViews,
      icon: Eye,
      description: 'Bugün görüntülenen ürün',
    },
    {
      title: 'Haftalık Ziyaret',
      value: stats.weeklyVisits,
      icon: TrendingUp,
      description: 'Bu hafta toplam ziyaret',
    },
    {
      title: 'Aylık Ziyaret',
      value: stats.monthlyVisits,
      icon: BarChart3,
      description: 'Bu ay toplam ziyaret',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kontrol Paneli</h2>
          <p className="text-muted-foreground">
            {cafeName ? `${cafeName} menü yönetim sistemi` : 'QR Cafe menü yönetim sistemi'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hoş Geldiniz</CardTitle>
              <CardDescription>
                {cafeName ? `${cafeName} yönetim sistemi` : 'QR Cafe menü yönetim sistemi'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sol menüden kategoriler, ürünler, istatistikler ve ayarlar bölümlerine erişebilirsiniz.
                Sistem otomatik olarak müşteri ziyaretlerini ve ürün görüntülemelerini takip eder.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>
                Sık kullanılan işlemler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-col space-y-2">
                <a href="/admin/products" className="text-sm text-primary hover:underline">
                  → Yeni ürün ekle
                </a>
                <a href="/admin/categories" className="text-sm text-primary hover:underline">
                  → Kategori yönet
                </a>
                <a href="/admin/analytics" className="text-sm text-primary hover:underline">
                  → İstatistikleri görüntüle
                </a>
                <a href="/admin/settings" className="text-sm text-primary hover:underline">
                  → Cafe ayarları
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}