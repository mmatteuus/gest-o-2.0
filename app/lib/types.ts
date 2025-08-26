
export type UserRole = 'USER' | 'MASTER';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number; // in minutes
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  client_id: string;
  status: OrderStatus;
  total_value: number;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  client?: Client;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  service_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
  service?: Service;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalClients: number;
  totalProducts: number;
  totalServices: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

// Console de Código Types
export type SnippetKind = 'task-js' | 'report-sql' | 'ui-mdx';

export interface Snippet {
  id: string;
  title: string;
  kind: SnippetKind;
  code: string;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  snippet_id?: string;
  execution_time?: number;
  result?: string;
  error?: string;
  created_at: string;
}

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  execution_time?: number;
}
