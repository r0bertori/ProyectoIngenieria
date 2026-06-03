'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
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

const statusTransitions: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'INCIDENT_REPORTED'],
  DELIVERED: ['INCIDENT_REPORTED'],
  CANCELLED: [],
  INCIDENT_REPORTED: ['DELIVERED', 'CANCELLED'],
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  store: { id: string; name: string };
  distributor: { id: string; name: string };
  _count: { items: number; incidents: number };
}

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function OrdersManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [comment, setComment] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<OrdersResponse>({
    queryKey: ['orders', { search, status: statusFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '15');
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return apiClient.get(`/orders?${params.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { orderId: string; status: string; trackingNumber?: string; comment?: string }) =>
      apiClient.patch(`/orders/${data.orderId}/status`, {
        status: data.status,
        trackingNumber: data.trackingNumber,
        comment: data.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setComment('');
      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido se ha actualizado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      trackingNumber: trackingNumber || undefined,
      comment: comment || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return <Package className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      case 'INCIDENT_REPORTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">
            {data?.meta.total || 0} pedidos en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o tienda..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No hay pedidos</h2>
              <p className="text-muted-foreground">
                No se encontraron pedidos con los filtros seleccionados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Pedido</th>
                    <th className="text-left p-4 font-medium">Tienda</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Productos</th>
                    <th className="text-right p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-right p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <span className="font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">{order.store.name}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
                            statusColors[order.status]
                          )}
                        >
                          {getStatusIcon(order.status)}
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">
                          {order._count.items} items
                        </span>
                        {order._count.incidents > 0 && (
                          <span className="ml-2 text-orange-500">
                            ({order._count.incidents} inc.)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/orders/${order.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {statusTransitions[order.status]?.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus('');
                                setTrackingNumber('');
                                setComment('');
                              }}
                            >
                              Cambiar Estado
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 15 + 1} a {Math.min(page * 15, data.meta.total)} de {data.meta.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} - {selectedOrder?.store.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado actual</Label>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium',
                  selectedOrder && statusColors[selectedOrder.status]
                )}
              >
                {selectedOrder && statusLabels[selectedOrder.status]}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nuevo estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder &&
                    statusTransitions[selectedOrder.status]?.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'SHIPPED' && (
              <div className="space-y-2">
                <Label>Número de seguimiento (opcional)</Label>
                <Input
                  placeholder="Ej: 1Z999AA10123456784"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Comentario (opcional)</Label>
              <Input
                placeholder="Añadir un comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
