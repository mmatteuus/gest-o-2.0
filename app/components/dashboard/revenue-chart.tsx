
'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

interface RevenueChartProps {
  userId: string;
}

interface ChartData {
  month: string;
  receita: number;
  despesas: number;
}

export function RevenueChart({ userId }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [userId]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      
      // Get last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        });
      }

      const chartData: ChartData[] = [];

      for (const month of months) {
        // Get revenue from completed orders
        const { data: orders } = await supabase
          .from('orders')
          .select('total_value, created_at')
          .eq('user_id', userId)
          .eq('status', 'COMPLETED')
          .gte('created_at', `${month.key}-01`)
          .lt('created_at', `${month.key}-32`);

        // Get expenses
        const { data: expenses } = await supabase
          .from('expenses')
          .select('value, expense_date')
          .eq('user_id', userId)
          .gte('expense_date', `${month.key}-01`)
          .lt('expense_date', `${month.key}-32`);

        const totalRevenue = orders?.reduce((sum, order) => {
          return sum + parseFloat(order.total_value?.toString() || '0');
        }, 0) || 0;

        const totalExpenses = expenses?.reduce((sum, expense) => {
          return sum + parseFloat(expense.value?.toString() || '0');
        }, 0) || 0;

        chartData.push({
          month: month.name,
          receita: totalRevenue,
          despesas: totalExpenses,
        });
      }

      setData(chartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-80 w-full animate-pulse bg-muted rounded" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" aspect={2.5}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis 
          dataKey="month" 
          tickLine={false}
          tick={{ fontSize: 10 }}
          angle={0}
          textAnchor="middle"
        />
        <YAxis 
          tickLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
            }).format(value)
          }
          label={{ 
            value: 'Valor (R$)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 11 }
          }}
        />
        <Tooltip 
          formatter={(value: number) => [
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value),
            '',
          ]}
          labelFormatter={(label) => `Período: ${label}`}
          contentStyle={{ fontSize: 11 }}
        />
        <Legend 
          verticalAlign="top"
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="receita" fill="#60B5FF" name="Receita" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" fill="#FF9149" name="Despesas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
