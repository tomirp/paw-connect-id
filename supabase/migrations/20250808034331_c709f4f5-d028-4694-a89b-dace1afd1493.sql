-- SECURITY MIGRATION: Enable RLS, define roles, and add safe policies

-- 1) Roles enum and user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'vet', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_merchant(_merchant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = _merchant_id AND m.owner_id = auth.uid()
  );
$$;

-- 3) Enable RLS on all application tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4) user_roles policies
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) users table policies + trigger to protect role column
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent non-admin updates to the `role` column on public.users
CREATE OR REPLACE FUNCTION public.prevent_non_admin_user_role_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.users;
CREATE TRIGGER trg_prevent_role_change
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_user_role_change();

-- 6) merchants policies + trigger protecting `verified`
DROP POLICY IF EXISTS "Merchants are viewable by everyone" ON public.merchants;
CREATE POLICY "Merchants are viewable by everyone" ON public.merchants
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can insert their merchant" ON public.merchants;
CREATE POLICY "Owners can insert their merchant" ON public.merchants
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can update their merchant" ON public.merchants;
CREATE POLICY "Owners can update their merchant" ON public.merchants
FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can delete their merchant" ON public.merchants;
CREATE POLICY "Owners can delete their merchant" ON public.merchants
FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.prevent_non_admin_verified_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.verified IS DISTINCT FROM OLD.verified THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can change verification status';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_prevent_verified_change ON public.merchants;
CREATE TRIGGER trg_prevent_verified_change
BEFORE UPDATE ON public.merchants
FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_verified_change();

-- 7) services policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone" ON public.services
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert services" ON public.services;
CREATE POLICY "Owner can insert services" ON public.services
FOR INSERT TO authenticated
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can update services" ON public.services;
CREATE POLICY "Owner can update services" ON public.services
FOR UPDATE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can delete services" ON public.services;
CREATE POLICY "Owner can delete services" ON public.services
FOR DELETE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

-- 8) products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert products" ON public.products;
CREATE POLICY "Owner can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can update products" ON public.products;
CREATE POLICY "Owner can update products" ON public.products
FOR UPDATE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can delete products" ON public.products;
CREATE POLICY "Owner can delete products" ON public.products
FOR DELETE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

-- 9) merchant_photos policies
DROP POLICY IF EXISTS "Merchant photos are viewable by everyone" ON public.merchant_photos;
CREATE POLICY "Merchant photos are viewable by everyone" ON public.merchant_photos
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert photos" ON public.merchant_photos;
CREATE POLICY "Owner can insert photos" ON public.merchant_photos
FOR INSERT TO authenticated
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can update photos" ON public.merchant_photos;
CREATE POLICY "Owner can update photos" ON public.merchant_photos
FOR UPDATE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owner can delete photos" ON public.merchant_photos;
CREATE POLICY "Owner can delete photos" ON public.merchant_photos
FOR DELETE TO authenticated
USING (public.owns_merchant(merchant_id) OR public.has_role(auth.uid(), 'admin'));

-- 10) reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reviews or admins" ON public.reviews;
CREATE POLICY "Users can update their own reviews or admins" ON public.reviews
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can delete their own reviews or admins" ON public.reviews;
CREATE POLICY "Users can delete their own reviews or admins" ON public.reviews
FOR DELETE TO authenticated
USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 11) bookings policies
DROP POLICY IF EXISTS "Bookings visible to participants and admins" ON public.bookings;
CREATE POLICY "Bookings visible to participants and admins" ON public.bookings
FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.merchants m WHERE m.id = merchant_id AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Participants and admins can update bookings" ON public.bookings;
CREATE POLICY "Participants and admins can update bookings" ON public.bookings
FOR UPDATE TO authenticated
USING (
  customer_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.merchants m WHERE m.id = merchant_id AND m.owner_id = auth.uid()
  )
)
WITH CHECK (
  customer_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.merchants m WHERE m.id = merchant_id AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers and admins can delete bookings" ON public.bookings;
CREATE POLICY "Customers and admins can delete bookings" ON public.bookings
FOR DELETE TO authenticated
USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 12) chat_messages policies
DROP POLICY IF EXISTS "Chat visible to participants" ON public.chat_messages;
CREATE POLICY "Chat visible to participants" ON public.chat_messages
FOR SELECT TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can send chat messages" ON public.chat_messages;
CREATE POLICY "Users can send chat messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders or admins can delete messages" ON public.chat_messages;
CREATE POLICY "Senders or admins can delete messages" ON public.chat_messages
FOR DELETE TO authenticated
USING (sender_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
