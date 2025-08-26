
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/lib/types';
import { Users } from 'lucide-react';

interface ClientsContentProps {
  user: Profile;
}

export function ClientsContent({ user }: ClientsContentProps) {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie seus clientes e informações de contato.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Clientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Funcionalidade de clientes em desenvolvimento...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
