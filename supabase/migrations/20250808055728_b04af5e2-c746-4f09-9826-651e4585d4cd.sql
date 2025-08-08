-- Core utility function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pets table (profile hewan)
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  birthdate date,
  gender text,
  avatar_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'Owners and admins can view pets'
  ) THEN
    CREATE POLICY "Owners and admins can view pets"
      ON public.pets FOR SELECT
      USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'Owners can manage their pets'
  ) THEN
    CREATE POLICY "Owners can manage their pets"
      ON public.pets FOR ALL
      USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Categories (generic for products/services/merchants)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('product','service','merchant')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories are viewable by everyone'
  ) THEN
    CREATE POLICY "Categories are viewable by everyone"
      ON public.categories FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Only admins manage categories'
  ) THEN
    CREATE POLICY "Only admins manage categories"
      ON public.categories FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Carts
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'carts' AND policyname = 'Users and admins can view their carts'
  ) THEN
    CREATE POLICY "Users and admins can view their carts"
      ON public.carts FOR SELECT
      USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'carts' AND policyname = 'Users can manage their carts'
  ) THEN
    CREATE POLICY "Users can manage their carts"
      ON public.carts FOR ALL
      USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

CREATE OR REPLACE TRIGGER update_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric NOT NULL DEFAULT 0
);

-- Validation trigger: either product_id or service_id, but not both null or both set
CREATE OR REPLACE FUNCTION public.validate_cart_item()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.product_id IS NULL AND NEW.service_id IS NULL) OR (NEW.product_id IS NOT NULL AND NEW.service_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Exactly one of product_id or service_id must be set';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_cart_item ON public.cart_items;
CREATE TRIGGER trg_validate_cart_item
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.validate_cart_item();

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cart_items' AND policyname = 'Users can view their cart items'
  ) THEN
    CREATE POLICY "Users can view their cart items"
      ON public.cart_items FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cart_items' AND policyname = 'Users can manage their cart items'
  ) THEN
    CREATE POLICY "Users can manage their cart items"
      ON public.cart_items FOR ALL
      USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))))
      WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));
  END IF;
END $$;

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_id uuid,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Participants and admins can view orders'
  ) THEN
    CREATE POLICY "Participants and admins can view orders"
      ON public.orders FOR SELECT
      USING (
        user_id = auth.uid()
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Users can create their orders'
  ) THEN
    CREATE POLICY "Users can create their orders"
      ON public.orders FOR INSERT
      WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Participants and admins can update orders'
  ) THEN
    CREATE POLICY "Participants and admins can update orders"
      ON public.orders FOR UPDATE
      USING (
        user_id = auth.uid()
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
      )
      WITH CHECK (
        user_id = auth.uid()
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = orders.merchant_id AND m.owner_id = auth.uid())
      );
  END IF;
END $$;

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric NOT NULL DEFAULT 0
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Participants can view order items'
  ) THEN
    CREATE POLICY "Participants can view order items"
      ON public.order_items FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_items.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Participants can manage order items'
  ) THEN
    CREATE POLICY "Participants can manage order items"
      ON public.order_items FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_items.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_items.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      );
  END IF;
END $$;

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  provider text DEFAULT 'mock',
  status text NOT NULL DEFAULT 'pending',
  payment_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Participants and admins can view payments'
  ) THEN
    CREATE POLICY "Participants and admins can view payments"
      ON public.payments FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = payments.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Participants and admins can manage payments'
  ) THEN
    CREATE POLICY "Participants and admins can manage payments"
      ON public.payments FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = payments.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = payments.order_id AND (
            o.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
              SELECT 1 FROM public.merchants m WHERE m.id = o.merchant_id AND m.owner_id = auth.uid()
            )
          )
        )
      );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
