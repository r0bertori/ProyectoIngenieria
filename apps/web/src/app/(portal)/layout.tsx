'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Package2,
  ShoppingCart,
  FileText,
  AlertCircle,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Catálogo', href: '/catalog', icon: Package2 },
  { name: 'Carrito', href: '/cart', icon: ShoppingCart },
  { name: 'Mis Pedidos', href: '/orders', icon: FileText },
  { name: 'Incidencias', href: '/incidents', icon: AlertCircle },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="flex items-center gap-2">
              <Package2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">Cosmetic Pipeline</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-sm">
              <span className="font-medium">{user.firstName} {user.lastName}</span>
              <span className="text-muted-foreground text-xs">{user.organization.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
