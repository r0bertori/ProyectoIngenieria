'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  INCIDENT_REPORTED: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En Preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  INCIDENT_REPORTED: 'Incidencia',
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  store: { id: string; name: string };
  _count: { items: number; incidents: number };
}

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<OrdersResponse>({
    queryKey: ['orders', { search, page }],
    queryFn: () =>
      apiClient.get(`/orders?page=${page}&limit=10&search=${search}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            {data?.meta.total || 0} pedidos
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No hay pedidos</h2>
          <p className="text-muted-foreground">
            Tus pedidos aparecerán aquí
          </p>
          <Button onClick={() => window.location.href = '/catalog'}>
            Ir al Catálogo
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{order.orderNumber}</span>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              statusColors[order.status],
                            )}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)} - {order._count.items} productos
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {page} de {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
