-- Roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'driver', 'chairman', 'admin');
CREATE TYPE public.driver_status AS ENUM ('pending', 'verified', 'suspended', 'rejected');
CREATE TYPE public.stage_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE public.ride_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'cash');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid');
CREATE TYPE public.panic_status AS ENUM ('active', 'resolved');
CREATE TYPE public.language_pref AS ENUM ('en', 'sw');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  name TEXT,
  avatar_url TEXT,
  language_preference public.language_pref NOT NULL DEFAULT 'en',
  low_data_mode BOOLEAN NOT NULL DEFAULT false,
  emergency_contacts TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles (separate table — security critical)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- stages
CREATE TABLE public.stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL,
  chairman_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  status public.stage_status NOT NULL DEFAULT 'pending',
  total_drivers INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- drivers
CREATE TABLE public.drivers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
  stage_name TEXT,
  status public.driver_status NOT NULL DEFAULT 'pending',
  national_id_front_url TEXT,
  national_id_back_url TEXT,
  selfie_url TEXT,
  logbook_url TEXT,
  plate_url TEXT,
  psv_url TEXT,
  helmet_verified BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ,
  rating_average NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_rides INT NOT NULL DEFAULT 0,
  total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- rides
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.stages(id),
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  pickup_address TEXT,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  dropoff_address TEXT,
  status public.ride_status NOT NULL DEFAULT 'requested',
  fare_estimate NUMERIC(10,2),
  fare_final NUMERIC(10,2),
  platform_fee NUMERIC(10,2),
  driver_payout NUMERIC(10,2),
  payment_method public.payment_method DEFAULT 'mpesa',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  mpesa_transaction_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT
);
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  rated_by TEXT NOT NULL CHECK (rated_by IN ('customer','driver')),
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- panic_events
CREATE TABLE public.panic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  audio_url TEXT,
  photo_url TEXT,
  status public.panic_status NOT NULL DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.panic_events ENABLE ROW LEVEL SECURITY;

-- broadcasts
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chairman_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  template_key TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_count INT NOT NULL DEFAULT 0
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- earnings
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  gross_amount NUMERIC(10,2) NOT NULL,
  platform_fee_amount NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  mpesa_transaction_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_day TEXT NOT NULL,
  period_week TEXT NOT NULL,
  period_month TEXT NOT NULL
);
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Auto-create profile + default customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name)
  VALUES (NEW.id, NEW.phone, COALESCE(NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "chairmen read driver profiles in stage" ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      JOIN public.stages s ON s.id = d.stage_id
      WHERE d.user_id = profiles.id AND s.chairman_id = auth.uid()
    )
  );

-- user_roles
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users self-assign driver or chairman role" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('driver', 'chairman'));

-- stages
CREATE POLICY "anyone signed-in reads stages" ON public.stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "chairman manages own stage" ON public.stages FOR ALL TO authenticated
  USING (chairman_id = auth.uid()) WITH CHECK (chairman_id = auth.uid());
CREATE POLICY "user creates stage as chairman" ON public.stages FOR INSERT TO authenticated
  WITH CHECK (chairman_id = auth.uid() AND public.has_role(auth.uid(), 'chairman'));

-- drivers
CREATE POLICY "driver reads own record" ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "driver inserts own record" ON public.drivers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "driver updates own record" ON public.drivers FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "chairman reads stage drivers" ON public.drivers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = drivers.stage_id AND s.chairman_id = auth.uid()));
CREATE POLICY "chairman updates stage drivers" ON public.drivers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = drivers.stage_id AND s.chairman_id = auth.uid()));
CREATE POLICY "customers read verified online drivers" ON public.drivers FOR SELECT TO authenticated
  USING (status = 'verified' AND is_online = true);

-- rides
CREATE POLICY "customer creates ride" ON public.rides FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "ride parties read" ON public.rides FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR driver_id = auth.uid());
CREATE POLICY "ride parties update" ON public.rides FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR driver_id = auth.uid());
CREATE POLICY "verified drivers read open requests" ON public.rides FOR SELECT TO authenticated
  USING (status = 'requested' AND public.has_role(auth.uid(), 'driver'));

-- ratings
CREATE POLICY "anyone signed-in reads ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "rater creates rating" ON public.ratings FOR INSERT TO authenticated WITH CHECK (rater_id = auth.uid());

-- panic_events
CREATE POLICY "panic parties read" ON public.panic_events FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR driver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "customer creates panic" ON public.panic_events FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "admin updates panic" ON public.panic_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR customer_id = auth.uid());

-- broadcasts
CREATE POLICY "chairman creates broadcast" ON public.broadcasts FOR INSERT TO authenticated WITH CHECK (chairman_id = auth.uid());
CREATE POLICY "chairman reads own broadcasts" ON public.broadcasts FOR SELECT TO authenticated USING (chairman_id = auth.uid());
CREATE POLICY "stage drivers read broadcasts" ON public.broadcasts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.drivers d WHERE d.user_id = auth.uid() AND d.stage_id = broadcasts.stage_id));

-- earnings
CREATE POLICY "driver reads own earnings" ON public.earnings FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- Indexes
CREATE INDEX idx_drivers_stage ON public.drivers(stage_id);
CREATE INDEX idx_drivers_online ON public.drivers(is_online, status);
CREATE INDEX idx_rides_customer ON public.rides(customer_id);
CREATE INDEX idx_rides_driver ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_earnings_driver ON public.earnings(driver_id);
CREATE INDEX idx_stages_chairman ON public.stages(chairman_id);
