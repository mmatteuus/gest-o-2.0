
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Order, Client } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Calendar, User, DollarSign } from 'lucide-react';

interface RecentOrdersProps {
  userId: string;
}

interface OrderWithClient extends Order {
  client: Client;
}

export function RecentOrders({ userId }: RecentOrdersProps) {
  const [orders, setOrders] = useState<OrderWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, [userId]);

  const loadRecentOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading recent orders:', error);
        return;
      }

      setOrders((data as OrderWithClient[]) || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      OPEN: 'secondary',
      IN_PROGRESS: 'default',
      COMPLETED: 'secondary',
      CANCELLED: 'destructive',
    };

    const labels: Record<string, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-4">
          Nenhuma ordem de serviço encontrada
        </p>
        <Button asChild>
          <Link href="/ordens">Criar Nova Ordem</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium">
                OS #{order.id.slice(0, 8)}
              </h4>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{order.client?.name || 'Cliente não encontrado'}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(order.total_value?.toString() || '0'))}
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/ordens/${order.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
      
      <div className="flex justify-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/ordens">Ver Todas as Ordens</Link>
        </Button>
      </div>
    </div>
  );
}
