'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: { finalPrice: number; basePrice: number; discountPercent: number } | null;
  stock: number;
}

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', { search, page }],
    queryFn: () =>
      apiClient.get(`/products?page=${page}&limit=12&search=${search}`),
  });

  const addToCart = async (productId: string) => {
    try {
      await apiClient.post('/cart/items', { productId, quantity: 1 });
      toast({
        title: 'Producto añadido',
        description: 'El producto se ha añadido al carrito',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo añadir el producto',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
          <p className="text-muted-foreground">
            {data?.meta.total || 0} productos disponibles
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.data.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-muted">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  {product.price?.discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                      -{product.price.discountPercent}%
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                  <h3 className="font-medium line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    SKU: {product.sku}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      {product.price ? (
                        <p className="font-semibold text-lg">
                          {formatCurrency(product.price.finalPrice)}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm">Consultar precio</p>
                      )}
                      {product.stock > 0 ? (
                        <p className="text-xs text-green-600">
                          {product.stock} en stock
                        </p>
                      ) : (
                        <p className="text-xs text-red-500">Sin stock</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product.id)}
                      disabled={!product.stock || !product.price}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
