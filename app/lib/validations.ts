
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
});

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo'),
  stock: z.number().min(0, 'Estoque deve ser positivo'),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo'),
  duration: z.number().min(1, 'Duração deve ser positiva').optional(),
});

export const orderSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  description: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid().optional(),
    service_id: z.string().uuid().optional(),
    quantity: z.number().min(1, 'Quantidade deve ser positiva'),
  })).min(1, 'Pelo menos um item deve ser adicionado'),
});

export const expenseSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  value: z.number().min(0, 'Valor deve ser positivo'),
  category: z.string().min(2, 'Categoria deve ter pelo menos 2 caracteres'),
  expense_date: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
