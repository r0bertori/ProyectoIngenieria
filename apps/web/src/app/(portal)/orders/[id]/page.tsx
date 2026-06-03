'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';
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

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: <Circle className="h-4 w-4" />,
  SUBMITTED: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  PREPARING: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
  INCIDENT_REPORTED: <AlertCircle className="h-4 w-4" />,
};

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { id: string; imageUrl: string | null };
}

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  store: { id: string; name: string };
  distributor: { id: string; name: string };
  user: { id: string; firstName: string; lastName: string; email: string };
  items: OrderItem[];
  statusHistory: StatusHistory[];
  incidents: { id: string; type: string; status: string; description: string }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => apiClient.get(`/orders/${orderId}`),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-48 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">Pedido no encontrado</h2>
        <Button onClick={() => router.push('/orders')}>Volver a pedidos</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <span
              className={cn(
                'text-sm px-3 py-1 rounded-full font-medium',
                statusColors[order.status]
              )}
            >
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="text-muted-foreground">
            Pedido realizado el {formatDate(order.createdAt)}
          </p>
        </div>
        {order.status === 'DELIVERED' && order.incidents.length === 0 && (
          <Link href={`/incidents?orderId=${order.id}`}>
            <Button variant="outline">Reportar Incidencia</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({order.taxPercent}%)</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.store.name}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              <p className="text-muted-foreground">
                {order.shippingPostalCode} {order.shippingCity}
              </p>
              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Número de seguimiento</p>
                  <p className="font-mono font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incidencias */}
          {order.incidents.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Incidencias ({order.incidents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.incidents.map((incident) => (
                    <div key={incident.id} className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{incident.type}</span>
                        <span className="text-sm text-orange-600">{incident.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted" />
                <div className="space-y-6">
                  {order.statusHistory.map((history, index) => (
                    <div key={history.id} className="relative flex gap-4">
                      <div
                        className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center z-10',
                          index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        {statusIcons[history.toStatus] || <Circle className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="font-medium">{statusLabels[history.toStatus]}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(history.createdAt)}
                        </p>
                        {history.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{history.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.estimatedDelivery && order.status !== 'DELIVERED' && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Entrega estimada</p>
                  <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                </div>
              )}

              {order.deliveredAt && (
                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Entregado el</p>
                  <p className="font-medium">{formatDate(order.deliveredAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
