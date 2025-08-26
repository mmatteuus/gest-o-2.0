
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  format?: 'number' | 'currency';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  format = 'number',
  className,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = value;
      const duration = 1500;
      const increment = end / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  const formatValue = (num: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    }
    return num.toLocaleString('pt-BR');
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold animate-count-up">
          {formatValue(displayValue)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
