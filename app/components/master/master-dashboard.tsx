
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';
import {
  Code,
  Database,
  Users,
  Shield,
  Activity,
  Settings,
  FileText,
  ChevronRight,
  Crown,
  Terminal,
} from 'lucide-react';

interface MasterDashboardProps {
  user: Profile;
}

export function MasterDashboard({ user }: MasterDashboardProps) {
  const features = [
    {
      title: 'Console de Código',
      description: 'Execute JavaScript, consultas SQL e valide MDX com segurança',
      icon: Code,
      href: '/master/code',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administrar perfis, roles e permissões do sistema',
      icon: Users,
      href: '/master/users',
      color: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      title: 'Banco de Dados',
      description: 'Visualizar estrutura e monitorar performance do banco',
      icon: Database,
      href: '/master/database',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Logs de Segurança',
      description: 'Auditoria completa de ações e execuções no sistema',
      icon: Shield,
      href: '/master/security',
      color: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-600',
    },
    {
      title: 'Monitoramento',
      description: 'Métricas de performance e saúde do sistema',
      icon: Activity,
      href: '/master/monitoring',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Configurações',
      description: 'Configurações avançadas e parâmetros do sistema',
      icon: Settings,
      href: '/master/settings',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-600',
    },
  ];

  const quickActions = [
    {
      label: 'Executar JavaScript',
      href: '/master/code?type=task-js',
      icon: Terminal,
    },
    {
      label: 'Consulta SQL',
      href: '/master/code?type=report-sql',
      icon: Database,
    },
    {
      label: 'Criar MDX',
      href: '/master/code?type=ui-mdx',
      icon: FileText,
    },
  ];

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold tracking-tight">Área MASTER</h1>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Acesso Administrativo
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Bem-vindo ao painel administrativo, {user.name || user.email}! 
          Acesse ferramentas avançadas e configurações do sistema.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>Ações Rápidas</span>
          </CardTitle>
          <CardDescription>
            Acesso direto às ferramentas mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  asChild
                  className="justify-start h-auto p-4"
                >
                  <Link href={action.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className={`transition-all hover:shadow-lg ${feature.color}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                    <span>{feature.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </CardTitle>
                <CardDescription className="text-current opacity-70">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full justify-start p-0">
                  <Link href={feature.href} className="text-current">
                    Acessar →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <Shield className="h-5 w-5" />
            <span>Aviso de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            <strong>Atenção:</strong> Você está na área administrativa do sistema com privilégios 
            MASTER. Todas as ações são monitoradas e registradas nos logs de auditoria. 
            Use estas ferramentas com responsabilidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
