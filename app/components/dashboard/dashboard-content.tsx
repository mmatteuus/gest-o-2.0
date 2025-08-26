
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrdersChart } from '@/components/dashboard/orders-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { Profile, DashboardMetrics } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Package,
  Wrench,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface DashboardContentProps {
  user: Profile;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Load metrics in parallel
      const [
        { data: orders },
        { data: clients },
        { data: products },
        { data: services },
        { data: expenses },
      ] = await Promise.all([
        supabase.from('orders').select('status, total_value').eq('user_id', user.id),
        supabase.from('clients').select('id').eq('user_id', user.id),
        supabase.from('products').select('id').eq('user_id', user.id),
        supabase.from('services').select('id').eq('user_id', user.id),
        supabase.from('expenses').select('value').eq('user_id', user.id),
      ]);

      // Calculate metrics
      const totalOrders = orders?.length || 0;
      const openOrders = orders?.filter(o => o.status === 'OPEN')?.length || 0;
      const inProgressOrders = orders?.filter(o => o.status === 'IN_PROGRESS')?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'COMPLETED')?.length || 0;
      
      const totalRevenue = orders
        ?.filter(o => o.status === 'COMPLETED')
        ?.reduce((sum, order) => sum + (parseFloat(order.total_value?.toString() || '0')), 0) || 0;
      
      const totalExpenses = expenses
        ?.reduce((sum, expense) => sum + (parseFloat(expense.value?.toString() || '0')), 0) || 0;

      const dashboardMetrics: DashboardMetrics = {
        totalOrders,
        openOrders,
        inProgressOrders,
        completedOrders,
        totalClients: clients?.length || 0,
        totalProducts: products?.length || 0,
        totalServices: services?.length || 0,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      };

      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="h-96 rounded-lg bg-muted lg:col-span-4"></div>
            <div className="h-96 rounded-lg bg-muted lg:col-span-3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user.name || user.email}! Aqui está um resumo do seu negócio.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Clientes"
          value={metrics.totalClients}
          icon={Users}
          description="Clientes cadastrados"
        />
        <StatsCard
          title="Produtos"
          value={metrics.totalProducts}
          icon={Package}
          description="Produtos disponíveis"
        />
        <StatsCard
          title="Serviços"
          value={metrics.totalServices}
          icon={Wrench}
          description="Serviços oferecidos"
        />
        <StatsCard
          title="Ordens de Serviço"
          value={metrics.totalOrders}
          icon={FileText}
          description="Total de ordens"
        />
      </div>

      {/* Financial Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Receita Total"
          value={metrics.totalRevenue}
          icon={TrendingUp}
          description="Receita de ordens concluídas"
          format="currency"
          className="border-green-200 bg-green-50 text-green-900"
        />
        <StatsCard
          title="Despesas Totais"
          value={metrics.totalExpenses}
          icon={TrendingDown}
          description="Total de despesas"
          format="currency"
          className="border-red-200 bg-red-50 text-red-900"
        />
        <StatsCard
          title="Lucro Líquido"
          value={metrics.netProfit}
          icon={DollarSign}
          description="Receita - Despesas"
          format="currency"
          className={
            metrics.netProfit >= 0
              ? "border-blue-200 bg-blue-50 text-blue-900"
              : "border-orange-200 bg-orange-50 text-orange-900"
          }
        />
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Ordens Abertas"
          value={metrics.openOrders}
          icon={FileText}
          description="Aguardando início"
          className="border-yellow-200 bg-yellow-50 text-yellow-900"
        />
        <StatsCard
          title="Em Andamento"
          value={metrics.inProgressOrders}
          icon={FileText}
          description="Sendo executadas"
          className="border-blue-200 bg-blue-50 text-blue-900"
        />
        <StatsCard
          title="Concluídas"
          value={metrics.completedOrders}
          icon={FileText}
          description="Ordens finalizadas"
          className="border-green-200 bg-green-50 text-green-900"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>
              Comparativo financeiro dos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart userId={user.id} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status das Ordens</CardTitle>
            <CardDescription>
              Distribuição das ordens por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersChart metrics={metrics} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens Recentes</CardTitle>
          <CardDescription>
            Últimas ordens de serviço criadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrders userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
