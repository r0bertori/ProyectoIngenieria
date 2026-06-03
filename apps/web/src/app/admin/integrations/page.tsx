'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  Package,
  ShoppingCart,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportLog {
  id: string;
  type: string;
  fileName: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: string[] | null;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
}

const exportTypes = [
  { value: 'products', label: 'Productos', icon: Package },
  { value: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { value: 'users', label: 'Usuarios', icon: Users },
  { value: 'organizations', label: 'Organizaciones', icon: Building2 },
];

const importTypes = [
  { value: 'products', label: 'Productos', description: 'Importar o actualizar productos desde CSV' },
  { value: 'stock', label: 'Stock', description: 'Actualizar niveles de stock' },
  { value: 'prices', label: 'Precios', description: 'Actualizar precios de productos' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Error',
};

export default function IntegrationsPage() {
  const [selectedExportType, setSelectedExportType] = useState('products');
  const [selectedImportType, setSelectedImportType] = useState('products');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const { data: importLogs, refetch: refetchLogs } = useQuery<ImportLog[]>({
    queryKey: ['import-logs'],
    queryFn: () => apiClient.get('/integrations/logs'),
  });

  const exportMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiClient.get<Blob>(`/integrations/export/${type}`);
      return { blob: response, type };
    },
    onSuccess: ({ blob, type }) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'Exportación completada', description: 'El archivo CSV ha sido descargado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      await apiClient.uploadFile(`/integrations/import?type=${selectedImportType}`, file);
      toast({ title: 'Importación iniciada', description: 'El archivo está siendo procesado' });
      refetchLogs();
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = (type: string) => {
    let headers = '';
    switch (type) {
      case 'products':
        headers = 'sku,name,description,price,stock,minStock,categoryId,brandId';
        break;
      case 'stock':
        headers = 'sku,stock';
        break;
      case 'prices':
        headers = 'sku,price';
        break;
    }
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template_${type}.csv`);
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
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descarga los datos del sistema en formato CSV
            </p>

            <div className="grid grid-cols-2 gap-3">
              {exportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => exportMutation.mutate(type.value)}
                    disabled={exportMutation.isPending}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
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
                Arrastra un archivo CSV o haz clic para seleccionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate(selectedImportType)}
                >
                  Descargar plantilla
                </Button>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar archivo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Importaciones</span>
            <Button variant="ghost" size="sm" onClick={() => refetchLogs()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!importLogs || importLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay importaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Archivo</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Resultados</th>
                    <th className="text-left p-3 font-medium">Usuario</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {importLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <span className="font-mono text-sm">{log.fileName}</span>
                      </td>
                      <td className="p-3 capitalize">{log.type}</td>
                      <td className="p-3">
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium', statusColors[log.status])}>
                          {log.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                          {log.status === 'FAILED' && <XCircle className="h-3 w-3" />}
                          {log.status === 'PROCESSING' && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {log.status === 'PENDING' && <Clock className="h-3 w-3" />}
                          {statusLabels[log.status]}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600">{log.successRows} OK</span>
                          {log.errorRows > 0 && (
                            <span className="text-red-600 ml-2">{log.errorRows} errores</span>
                          )}
                          <span className="text-muted-foreground ml-2">/ {log.totalRows} total</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {log.createdBy.firstName} {log.createdBy.lastName}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(log.createdAt)}
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
