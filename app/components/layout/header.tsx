
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Users,
  Package,
  Wrench,
  FileText,
  Receipt,
  Crown,
  Code,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { isMasterAccount } from '@/lib/auth';

interface HeaderProps {
  user: Profile | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Produtos', href: '/produtos', icon: Package },
    { name: 'Serviços', href: '/servicos', icon: Wrench },
    { name: 'Ordens de Serviço', href: '/ordens', icon: FileText },
    { name: 'Despesas', href: '/despesas', icon: Receipt },
  ];

  const isMaster = user && isMasterAccount(user.email);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">GESTÃO O.S</span>
          </Link>

          {isMaster && (
            <Badge variant="secondary" className="ml-2">
              <Crown className="mr-1 h-3 w-3" />
              Conta MASTER
            </Badge>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isMaster && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith('/master')
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  <span>MASTER</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem asChild>
                  <Link href="/master" className="flex items-center">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/master/code" className="flex items-center">
                    <Code className="mr-2 h-4 w-4" />
                    <span>Console de Código</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mais ferramentas em breve...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name || 'Usuário'}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container mx-auto grid gap-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {isMaster && (
              <>
                <Link
                  href="/master"
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === '/master'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Crown className="h-4 w-4" />
                  <span>MASTER Dashboard</span>
                </Link>
                <Link
                  href="/master/code"
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === '/master/code'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Code className="h-4 w-4" />
                  <span>Console de Código</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
