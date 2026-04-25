'use client';

import { SessionProvider } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}