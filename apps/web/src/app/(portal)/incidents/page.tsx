'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Abierta',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelta',
  CLOSED: 'Cerrada',
};

const typeLabels: Record<string, string> = {
  DAMAGED: 'Producto dañado',
  WRONG_ITEM: 'Producto incorrecto',
  MISSING_ITEM: 'Producto faltante',
  QUALITY_ISSUE: 'Problema de calidad',
  DELIVERY_ISSUE: 'Problema de entrega',
  OTHER: 'Otro',
};

interface Incident {
  id: string;
  incidentNumber: string;
  type: string;
  status: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  order: {
    id: string;
    orderNumber: string;
    store: { id: string; name: string };
  };
  reportedBy: { id: string; firstName: string; lastName: string };
}

interface IncidentsResponse {
  data: Incident[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
}

interface OrdersResponse {
  data: Order[];
}

export default function IncidentsPage() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(!!initialOrderId);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<IncidentsResponse>({
    queryKey: ['incidents', { status: statusFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return apiClient.get(`/incidents?${params.toString()}`);
    },
  });

  const { data: ordersData } = useQuery<OrdersResponse>({
    queryKey: ['orders-for-incidents'],
    queryFn: () => apiClient.get('/orders?limit=100&status=DELIVERED'),
    enabled: isCreateOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: { orderId: string; type: string; description: string }) =>
      apiClient.post('/incidents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setIsCreateOpen(false);
      setSelectedOrderId('');
      setIncidentType('');
      setDescription('');
      toast({
        title: 'Incidencia creada',
        description: 'Tu incidencia ha sido registrada correctamente',
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

  const handleCreate = () => {
    if (!selectedOrderId || !incidentType || !description) return;
    createMutation.mutate({
      orderId: selectedOrderId,
      type: incidentType,
      description,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Incidencias</h1>
          <p className="text-muted-foreground">
            {data?.meta.total || 0} incidencias
          </p>
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Incidencia
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No hay incidencias</h2>
          <p className="text-muted-foreground text-center">
            Si tienes algún problema con un pedido, puedes reportar una incidencia
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Incidencia
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((incident) => (
            <Card key={incident.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{incident.incidentNumber}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                          statusColors[incident.status]
                        )}
                      >
                        {getStatusIcon(incident.status)}
                        {statusLabels[incident.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Pedido: {incident.order.orderNumber}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded">
                        {typeLabels[incident.type]}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">{incident.description}</p>

                    {incident.resolution && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" />
                          Resolución
                        </div>
                        <p className="text-sm text-green-600 mt-1">{incident.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground text-right">
                    <p>{formatDate(incident.createdAt)}</p>
                    {incident.resolvedAt && (
                      <p className="text-green-600">
                        Resuelta: {formatDate(incident.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Create Incident Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Incidencia</DialogTitle>
            <DialogDescription>
              Describe el problema que has tenido con tu pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pedido</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pedido" />
                </SelectTrigger>
                <SelectContent>
                  {ordersData?.data.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ordersData?.data.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tienes pedidos entregados para reportar incidencias
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de incidencia</Label>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe el problema con detalle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedOrderId || !incidentType || !description || createMutation.isPending}
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar Incidencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
