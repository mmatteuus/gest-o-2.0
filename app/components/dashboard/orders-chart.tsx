
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardMetrics } from '@/lib/types';

interface OrdersChartProps {
  metrics: DashboardMetrics;
}

const COLORS = {
  'Abertas': '#FF9149',
  'Em Andamento': '#60B5FF',
  'Concluídas': '#80D8C3',
  'Canceladas': '#FF6363',
};

export function OrdersChart({ metrics }: OrdersChartProps) {
  const data = [
    {
      name: 'Abertas',
      value: metrics.openOrders,
      color: COLORS['Abertas'],
    },
    {
      name: 'Em Andamento',
      value: metrics.inProgressOrders,
      color: COLORS['Em Andamento'],
    },
    {
      name: 'Concluídas',
      value: metrics.completedOrders,
      color: COLORS['Concluídas'],
    },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        <p>Nenhuma ordem de serviço encontrada</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" aspect={1.2}>
      <PieChart margin={{ top: 20, right: 5, bottom: 20, left: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [value, name]}
          contentStyle={{ fontSize: 11 }}
        />
        <Legend 
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
