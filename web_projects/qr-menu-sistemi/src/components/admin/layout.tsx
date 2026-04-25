'use client';

import { SessionProvider } from 'next-auth/react';
import AdminSidebar from './sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const [cafeName, setCafeName] = useState('');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b bg-card px-6 py-4 flex justify-between items-center">
          <div className="md:ml-0 ml-12">
            <h1 className="text-2xl font-semibold">{cafeName ? `${cafeName} Kontrol Paneli` : 'Yetkili Paneli'}</h1>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </SessionProvider>
  );
}