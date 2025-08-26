
-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MASTER')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Masters can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'MASTER'
    )
  );

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- Products policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Services policies
CREATE POLICY "Users can view own services" ON services
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own services" ON services
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own services" ON services
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own services" ON services
  FOR DELETE USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (user_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own order items" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (user_id = auth.uid());

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    CASE 
      WHEN NEW.email = 'mtsf26@gmail.com' THEN 'MASTER'
      ELSE 'USER'
    END
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('os-attachments', 'os-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'os-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'os-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'os-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'os-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
