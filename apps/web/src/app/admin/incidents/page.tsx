'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Search,
  Eye,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
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
  order: { id: string; orderNumber: string; store: { name: string } };
  reportedBy: { firstName: string; lastName: string };
  assignedTo: { firstName: string; lastName: string } | null;
}

interface IncidentsResponse {
  data: Incident[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function IncidentsManagementPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<IncidentsResponse>({
    queryKey: ['incidents-admin', { status: statusFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '15');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return apiClient.get(`/incidents?${params.toString()}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string; resolution?: string }) =>
      apiClient.patch(`/incidents/${data.id}`, { status: data.status, resolution: data.resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents-admin'] });
      setSelectedIncident(null);
      setNewStatus('');
      setResolution('');
      toast({ title: 'Incidencia actualizada', description: 'La incidencia ha sido actualizada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleUpdate = () => {
    if (!selectedIncident || !newStatus) return;
    updateMutation.mutate({
      id: selectedIncident.id,
      status: newStatus,
      resolution: resolution || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Incidencias</h1>
          <p className="text-muted-foreground">{data?.meta.total || 0} incidencias</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No hay incidencias</h2>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Incidencia</th>
                    <th className="text-left p-4 font-medium">Pedido</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Reportado por</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-right p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.map((incident) => (
                    <tr key={incident.id} className="hover:bg-muted/30">
                      <td className="p-4 font-medium">{incident.incidentNumber}</td>
                      <td className="p-4 text-muted-foreground">{incident.order.orderNumber}</td>
                      <td className="p-4"><span className="text-sm bg-muted px-2 py-0.5 rounded">{typeLabels[incident.type]}</span></td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium', statusColors[incident.status])}>
                          {incident.status === 'OPEN' && <AlertCircle className="h-3 w-3" />}
                          {incident.status === 'IN_PROGRESS' && <Clock className="h-3 w-3" />}
                          {(incident.status === 'RESOLVED' || incident.status === 'CLOSED') && <CheckCircle2 className="h-3 w-3" />}
                          {statusLabels[incident.status]}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{incident.reportedBy.firstName} {incident.reportedBy.lastName}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(incident.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedIncident(incident); setNewStatus(incident.status); setResolution(incident.resolution || ''); }}>
                          Gestionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {page} de {data.meta.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages}>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Incidencia</DialogTitle>
            <DialogDescription>{selectedIncident?.incidentNumber} - {selectedIncident?.order.orderNumber}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Descripción</p>
              <p className="text-sm text-muted-foreground">{selectedIncident?.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resolución</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe la resolución..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIncident(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
