'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  Calendar,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  openIncidents: number;
  lowStockProducts: number;
  ordersTrend: number;
  revenueTrend: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  totalSold: number;
  revenue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

const periodOptions = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: '1y', label: 'Último año' },
];

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', period],
    queryFn: () => apiClient.get(`/reports/stats?period=${period}`),
  });

  const { data: topProducts } = useQuery<TopProduct[]>({
    queryKey: ['top-products', period],
    queryFn: () => apiClient.get(`/reports/top-products?period=${period}&limit=5`),
  });

  const { data: ordersByStatus } = useQuery<OrdersByStatus[]>({
    queryKey: ['orders-by-status', period],
    queryFn: () => apiClient.get(`/reports/orders-by-status?period=${period}`),
  });

  const { data: revenueByMonth } = useQuery<RevenueByMonth[]>({
    queryKey: ['revenue-by-month'],
    queryFn: () => apiClient.get('/reports/revenue-by-month'),
  });

  const statCards = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats?.totalRevenue || 0),
      trend: stats?.revenueTrend || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Pedidos',
      value: stats?.totalOrders || 0,
      trend: stats?.ordersTrend || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Productos',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  const alertCards = [
    {
      title: 'Pedidos Pendientes',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: stats?.pendingOrders ? 'text-yellow-600' : 'text-green-600',
    },
    {
      title: 'Incidencias Abiertas',
      value: stats?.openIncidents || 0,
      icon: AlertTriangle,
      color: stats?.openIncidents ? 'text-red-600' : 'text-green-600',
    },
    {
      title: 'Stock Bajo',
      value: stats?.lowStockProducts || 0,
      icon: Package,
      color: stats?.lowStockProducts ? 'text-orange-600' : 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Métricas y estadísticas del sistema</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn('p-2 rounded-lg', stat.bg)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  {stat.trend !== undefined && (
                    <div className={cn('flex items-center text-sm', stat.trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {stat.trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {alertCards.map((alert) => {
          const Icon = alert.icon;
          return (
            <Card key={alert.title}>
              <CardContent className="p-4 flex items-center gap-4">
                <Icon className={cn('h-8 w-8', alert.color)} />
                <div>
                  <p className="text-2xl font-bold">{alert.value}</p>
                  <p className="text-sm text-muted-foreground">{alert.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!topProducts || topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.totalSold} uds</p>
                      <p className="text-sm text-green-600">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!ordersByStatus || ordersByStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            ) : (
              <div className="space-y-3">
                {ordersByStatus.map((item) => {
                  const total = ordersByStatus.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{statusLabels[item.status] || item.status}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ingresos Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!revenueByMonth || revenueByMonth.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-48">
                {revenueByMonth.map((item) => {
                  const maxRevenue = Math.max(...revenueByMonth.map((r) => r.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">
                          {formatCurrency(item.revenue)}
                        </span>
                        <div
                          className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                <span>Total: {formatCurrency(revenueByMonth.reduce((sum, r) => sum + r.revenue, 0))}</span>
                <span>{revenueByMonth.reduce((sum, r) => sum + r.orders, 0)} pedidos</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
