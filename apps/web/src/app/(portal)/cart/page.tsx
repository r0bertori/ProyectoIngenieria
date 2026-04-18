'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    imageUrl: string;
    stock: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => apiClient.get('/cart'),
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch(`/cart/items/${itemId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({ title: 'Producto eliminado del carrito' });
    },
  });

  const createOrder = useMutation({
    mutationFn: () => apiClient.post('/orders', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({ title: 'Pedido creado correctamente' });
      router.push('/orders');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mi Carrito</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">
          Añade productos desde el catálogo para empezar
        </p>
        <Button onClick={() => router.push('/catalog')}>Ver Catálogo</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Carrito</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.product.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.product.brand}
                    </p>
                    <h3 className="font-medium truncate">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.product.sku}
                    </p>
                    <p className="font-semibold mt-1">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cart.itemCount} productos)</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (21%)</span>
                <span>{formatCurrency(cart.taxAmount)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(cart.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => createOrder.mutate()}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? 'Procesando...' : 'Realizar Pedido'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
