'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Euro,
} from 'lucide-react';

interface DashboardData {
  summary: {
    ordersThisMonth: number;
    ordersLastMonth: number;
    ordersChange: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueChange: number;
    openIncidents: number;
  };
  ordersByStatus: Array<{ status: string; count: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    storeName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviados',
  CONFIRMED: 'Confirmados',
  PREPARING: 'En Preparación',
  SHIPPED: 'Enviados',
  DELIVERED: 'Entregados',
  CANCELLED: 'Cancelados',
  INCIDENT_REPORTED: 'Con Incidencia',
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del mes actual</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos del Mes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.ordersThisMonth}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {data.summary.ordersChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {data.summary.ordersChange.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Facturación del Mes
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.revenueThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {data.summary.revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {data.summary.revenueChange.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incidencias Abiertas
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.openIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de resolución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mes Anterior
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.ordersLastMonth}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.summary.revenueLastMonth)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{statusLabels[item.status] || item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
              {data.ordersByStatus.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.storeName}</p>
                  </div>
                  <span className="font-semibold text-sm">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              ))}
              {data.recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay pedidos recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
