'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Download,
  FileSpreadsheet,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface IntegrationJob {
  id: string;
  type: string;
  fileName: string | null;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  errorLog: string | null;
  createdAt: string;
}

interface JobsResponse {
  data: IntegrationJob[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const importTypes = [
  { value: 'catalog', label: 'Catálogo', description: 'Importar o actualizar productos desde CSV', endpoint: '/integrations/catalog/import' },
  { value: 'stock',   label: 'Stock',    description: 'Actualizar niveles de stock',              endpoint: '/integrations/stock/import' },
];

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  RUNNING:   'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED:    'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING:   'Pendiente',
  RUNNING:   'Procesando',
  COMPLETED: 'Completado',
  FAILED:    'Error',
};

const typeLabels: Record<string, string> = {
  CATALOG_IMPORT: 'Importar catálogo',
  STOCK_IMPORT:   'Importar stock',
  ORDER_EXPORT:   'Exportar pedidos',
};

export default function IntegrationsPage() {
  const [selectedImportType, setSelectedImportType] = useState('catalog');
  const [isUploading, setIsUploading]               = useState(false);
  const [isExporting, setIsExporting]               = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast }       = useToast();
  const queryClient     = useQueryClient();

  const { data: jobsData, refetch: refetchJobs } = useQuery<JobsResponse>({
    queryKey: ['integration-jobs'],
    queryFn:  () => apiClient.get('/integrations/jobs'),
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/integrations/orders/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Exportación completada', description: 'El CSV de pedidos ha sido descargado' });
      refetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const selected = importTypes.find((t) => t.value === selectedImportType)!;
      await apiClient.uploadFile(selected.endpoint, file);
      toast({ title: 'Importación completada', description: 'El archivo ha sido procesado' });
      queryClient.invalidateQueries({ queryKey: ['integration-jobs'] });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = (type: string) => {
    const headers =
      type === 'catalog'
        ? 'sku,ean,name,description,brand,category,subcategory,imageUrl'
        : 'sku,quantity';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `plantilla_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground">Importa y exporta datos del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descarga los pedidos del sistema en formato CSV
            </p>
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <ShoppingCart className="h-6 w-6" />
              )}
              <span>{isExporting ? 'Exportando...' : 'Exportar Pedidos'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de importación</label>
              <Select value={selectedImportType} onValueChange={setSelectedImportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Selecciona un archivo CSV para importar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate(selectedImportType)}>
                  Descargar plantilla
                </Button>
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Subiendo...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" />Seleccionar archivo</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Jobs</span>
            <Button variant="ghost" size="sm" onClick={() => refetchJobs()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!jobsData?.data.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay operaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-left p-3 font-medium">Archivo</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Resultados</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobsData.data.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/30">
                      <td className="p-3 text-sm font-medium">
                        {typeLabels[job.type] ?? job.type}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-muted-foreground">
                          {job.fileName ?? '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium', statusColors[job.status])}>
                          {job.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                          {job.status === 'FAILED'    && <XCircle className="h-3 w-3" />}
                          {job.status === 'RUNNING'   && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {job.status === 'PENDING'   && <Clock className="h-3 w-3" />}
                          {statusLabels[job.status] ?? job.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600">{job.recordsProcessed} OK</span>
                          {job.recordsFailed > 0 && (
                            <span className="text-red-600 ml-2">{job.recordsFailed} errores</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(job.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
