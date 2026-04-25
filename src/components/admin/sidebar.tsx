'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Kontrol Paneli',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Kategoriler',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Ürünler',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'İstatistikler',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Profil',
    href: '/admin/profile',
    icon: User,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cafeName, setCafeName] = useState('QR Cafe');

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

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">{cafeName}</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 w-64 h-screen bg-card border-r transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}