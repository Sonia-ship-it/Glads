-- GLADS Hotel Management System - Database Schema
-- PostgreSQL + Supabase
-- Date: February 14, 2026

-- =====================================================
-- 1. BRANCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  coordinates JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_branches_active ON branches(is_active);

-- =====================================================
-- 2. USERS TABLE (Extended from Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  profile_picture TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super-admin', 'super-manager', 'branch-manager', 'receptionist')),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"email": true, "inApp": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_role ON users(branch_id, role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- 3. ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('standard', 'deluxe', 'suite', 'penthouse')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  max_occupancy INTEGER NOT NULL,
  bed_type VARCHAR(100),
  size_sqm DECIMAL(10, 2),
  view_type VARCHAR(100),
  amenities TEXT[] DEFAULT '{}',
  images JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, room_number)
);

-- Indexes
CREATE INDEX idx_rooms_branch_status ON rooms(branch_id, status);
CREATE INDEX idx_rooms_branch_type ON rooms(branch_id, room_type);
CREATE INDEX idx_rooms_active ON rooms(is_active);

-- =====================================================
-- 4. ROOM AVAILABILITY TABLE (For Quick Lookups)
-- =====================================================
CREATE TABLE IF NOT EXISTS room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, date)
);

-- Indexes
CREATE UNIQUE INDEX idx_room_availability_room_date ON room_availability(room_id, date);
CREATE INDEX idx_room_availability_search ON room_availability(branch_id, date, is_available);

-- =====================================================
-- 5. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  guest_info JSONB NOT NULL,
  check_in_date TIMESTAMPTZ NOT NULL,
  check_out_date TIMESTAMPTZ NOT NULL,
  number_of_guests INTEGER NOT NULL,
  number_of_nights INTEGER NOT NULL,
  room_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  service_charges DECIMAL(10, 2) DEFAULT 0,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('pesapal', 'pay-at-property')),
  pesapal_payment_method VARCHAR(50) CHECK (pesapal_payment_method IN ('card', 'mobile-money', 'bank-transfer')),
  pesapal_transaction_id VARCHAR(255),
  source VARCHAR(50) CHECK (source IN ('website', 'walk-in', 'phone', 'ota-manual')),
  ota_platform VARCHAR(100),
  ota_reference VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_bookings_branch_dates ON bookings(branch_id, check_in_date, check_out_date);
CREATE UNIQUE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_guest_email ON bookings((guest_info->>'email'));
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_room ON bookings(room_id);

-- Add foreign key constraint for room_availability.booking_id
ALTER TABLE room_availability
ADD CONSTRAINT fk_room_availability_booking
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- =====================================================
-- 6. SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('spa', 'restaurant', 'transport', 'laundry', 'gym', 'other')),
  price DECIMAL(10, 2) NOT NULL,
  billing_type VARCHAR(50) DEFAULT 'one-time' CHECK (billing_type IN ('one-time', 'subscription')),
  subscription_period VARCHAR(50) CHECK (subscription_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  duration INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  availability_schedule JSONB DEFAULT '[]'::jsonb,
  max_bookings_per_slot INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_services_branch_active ON services(branch_id, is_active);
CREATE INDEX idx_services_category ON services(category);

-- =====================================================
-- 7. SERVICE BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  service_id UUID NOT NULL REFERENCES services(id),
  related_room_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  guest_info JSONB NOT NULL,
  service_date TIMESTAMPTZ NOT NULL,
  service_time VARCHAR(20),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('pesapal', 'pay-at-property')),
  pesapal_payment_method VARCHAR(50) CHECK (pesapal_payment_method IN ('card', 'mobile-money', 'bank-transfer')),
  pesapal_transaction_id VARCHAR(255),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  auto_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_service_bookings_branch ON service_bookings(branch_id);
CREATE INDEX idx_service_bookings_service ON service_bookings(service_id);
CREATE UNIQUE INDEX idx_service_bookings_reference ON service_bookings(booking_reference);

-- =====================================================
-- 8. GYM SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gym_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  membership_number VARCHAR(100) UNIQUE NOT NULL,
  subscription_period VARCHAR(50) NOT NULL CHECK (subscription_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_renewal BOOLEAN DEFAULT false,
  qr_code TEXT,
  access_code VARCHAR(50),
  renewal_reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gym_subscriptions_member ON gym_subscriptions(member_id);
CREATE INDEX idx_gym_subscriptions_branch ON gym_subscriptions(branch_id);
CREATE UNIQUE INDEX idx_gym_subscriptions_membership ON gym_subscriptions(membership_number);

-- =====================================================
-- 9. MENUS TABLE (Simple PDF/Image Menu)
-- =====================================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  menu_url TEXT NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_menus_branch_active ON menus(branch_id, is_active);
CREATE INDEX idx_menus_effective_date ON menus(effective_date DESC);

-- =====================================================
-- 10. NEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image JSONB,
  category VARCHAR(50) CHECK (category IN ('announcement', 'event', 'promotion', 'maintenance')),
  scope VARCHAR(50) DEFAULT 'branch-specific' CHECK (scope IN ('global', 'branch-specific')),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'guests', 'staff')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_status_published ON news(status, published_at DESC);
CREATE INDEX idx_news_branch_scope ON news(branch_id, scope);

-- =====================================================
-- 11. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_role VARCHAR(50),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'payment', 'system', 'alert')),
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- =====================================================
-- 12. TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  bio TEXT,
  photo_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_branch ON team_members(branch_id);

-- =====================================================
-- 13. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  pesapal_transaction_id VARCHAR(255),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  service_booking_id UUID REFERENCES service_bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RWF',
  payment_gateway VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- 14. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- 15. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gym_subscriptions_updated_at BEFORE UPDATE ON gym_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Helper functions to bypass RLS for role checks (security definer)
CREATE OR REPLACE FUNCTION public.check_user_role(user_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = ANY(allowed_roles)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_branch(user_id UUID, target_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND branch_id = target_branch_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_active(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM public.users WHERE id = user_id;
  RETURN user_email;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BRANCHES POLICIES
-- =====================================================

-- Allow all authenticated users to view active branches
CREATE POLICY "Allow authenticated users to view active branches"
  ON branches FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow super-admin and super-manager to view all branches
CREATE POLICY "Allow super admins to view all branches"
  ON branches FOR SELECT
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- Allow super-admin and super-manager to manage branches
CREATE POLICY "Allow super admins to manage branches"
  ON branches FOR ALL
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can view all users
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- Super admins can manage all users
CREATE POLICY "Super admins can manage users"
  ON users FOR ALL
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- Branch managers can view users in their branch
CREATE POLICY "Branch managers can view branch users"
  ON users FOR SELECT
  USING (
    public.check_user_role(auth.uid(), ARRAY['branch-manager']) 
    AND public.check_user_branch(auth.uid(), users.branch_id)
  );

-- =====================================================
-- ROOMS POLICIES
-- =====================================================

-- Allow anyone to view active rooms (for public website)
CREATE POLICY "Allow public to view active rooms"
  ON rooms FOR SELECT
  USING (is_active = true);

-- Staff can view all rooms in their branch
CREATE POLICY "Staff can view branch rooms"
  ON rooms FOR SELECT
  USING (public.check_user_branch(auth.uid(), rooms.branch_id));

-- Branch managers and above can manage rooms in their branch
CREATE POLICY "Managers can manage branch rooms"
  ON rooms FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (public.check_user_branch(auth.uid(), rooms.branch_id) 
        AND public.check_user_role(auth.uid(), ARRAY['branch-manager']))
  );

-- =====================================================
-- ROOM AVAILABILITY POLICIES
-- =====================================================

-- Allow anyone to view room availability
CREATE POLICY "Allow public to view room availability"
  ON room_availability FOR SELECT
  USING (true);

-- Staff can manage availability in their branch
CREATE POLICY "Staff can manage branch availability"
  ON room_availability FOR ALL
  USING (public.check_user_branch(auth.uid(), room_availability.branch_id));

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Guests can view their own bookings (by email)
CREATE POLICY "Guests can view own bookings"
  ON bookings FOR SELECT
  USING (
    public.get_user_email(auth.uid()) = (bookings.guest_info->>'email')
    OR (auth.jwt()->>'email') = (bookings.guest_info->>'email')
  );

-- Staff can view bookings in their branch
CREATE POLICY "Staff can view branch bookings"
  ON bookings FOR SELECT
  USING (public.check_user_branch(auth.uid(), bookings.branch_id));

-- Staff can manage bookings in their branch
CREATE POLICY "Staff can manage branch bookings"
  ON bookings FOR ALL
  USING (public.check_user_branch(auth.uid(), bookings.branch_id));

-- Super admins can view all bookings
CREATE POLICY "Super admins can view all bookings"
  ON bookings FOR SELECT
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- =====================================================
-- SERVICES POLICIES
-- =====================================================

-- Allow anyone to view active services
CREATE POLICY "Allow public to view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Staff can view all services in their branch
CREATE POLICY "Staff can view branch services"
  ON services FOR SELECT
  USING (public.check_user_branch(auth.uid(), services.branch_id));

-- Managers can manage services in their branch
CREATE POLICY "Managers can manage branch services"
  ON services FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (public.check_user_branch(auth.uid(), services.branch_id) 
        AND public.check_user_role(auth.uid(), ARRAY['branch-manager']))
  );

-- =====================================================
-- SERVICE BOOKINGS POLICIES
-- =====================================================

-- Guests can view their own service bookings
CREATE POLICY "Guests can view own service bookings"
  ON service_bookings FOR SELECT
  USING (
    public.get_user_email(auth.uid()) = (service_bookings.guest_info->>'email')
    OR (auth.jwt()->>'email') = (service_bookings.guest_info->>'email')
  );

-- Staff can view service bookings in their branch
CREATE POLICY "Staff can view branch service bookings"
  ON service_bookings FOR SELECT
  USING (public.check_user_branch(auth.uid(), service_bookings.branch_id));

-- Staff can manage service bookings in their branch
CREATE POLICY "Staff can manage branch service bookings"
  ON service_bookings FOR ALL
  USING (public.check_user_branch(auth.uid(), service_bookings.branch_id));

-- =====================================================
-- GYM SUBSCRIPTIONS POLICIES
-- =====================================================

-- Members can view their own subscriptions
CREATE POLICY "Members can view own subscriptions"
  ON gym_subscriptions FOR SELECT
  USING (auth.uid() = member_id);

-- Staff can view subscriptions in their branch
CREATE POLICY "Staff can view branch subscriptions"
  ON gym_subscriptions FOR SELECT
  USING (public.check_user_branch(auth.uid(), gym_subscriptions.branch_id));

-- Staff can manage subscriptions in their branch
CREATE POLICY "Staff can manage branch subscriptions"
  ON gym_subscriptions FOR ALL
  USING (public.check_user_branch(auth.uid(), gym_subscriptions.branch_id));

-- =====================================================
-- MENUS POLICIES
-- =====================================================

-- Allow anyone to view active menus
CREATE POLICY "Allow public to view active menus"
  ON menus FOR SELECT
  USING (is_active = true);

-- Staff can view all menus in their branch
CREATE POLICY "Staff can view branch menus"
  ON menus FOR SELECT
  USING (public.check_user_branch(auth.uid(), menus.branch_id));

-- Managers can manage menus in their branch
CREATE POLICY "Managers can manage branch menus"
  ON menus FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (public.check_user_branch(auth.uid(), menus.branch_id) 
        AND public.check_user_role(auth.uid(), ARRAY['branch-manager']))
  );

-- =====================================================
-- NEWS POLICIES
-- =====================================================

-- Allow anyone to view published news
CREATE POLICY "Allow public to view published news"
  ON news FOR SELECT
  USING (
    status = 'published' 
    AND published_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Staff can view news in their branch
CREATE POLICY "Staff can view branch news"
  ON news FOR SELECT
  USING (
    public.check_user_branch(auth.uid(), news.branch_id) 
    OR news.scope = 'global'
  );

-- Managers can manage news in their branch
CREATE POLICY "Managers can manage branch news"
  ON news FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (public.check_user_branch(auth.uid(), news.branch_id) 
        AND public.check_user_role(auth.uid(), ARRAY['branch-manager']))
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Staff can create notifications
CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (public.check_user_active(auth.uid()));

-- Super admins can manage all notifications
CREATE POLICY "Super admins can manage notifications"
  ON notifications FOR ALL
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- =====================================================
-- TEAM MEMBERS POLICIES
-- =====================================================

-- Allow anyone to view active team members
CREATE POLICY "Allow public to view active team members"
  ON team_members FOR SELECT
  USING (is_active = true);

-- Staff can view all team members in their branch
CREATE POLICY "Staff can view branch team members"
  ON team_members FOR SELECT
  USING (public.check_user_branch(auth.uid(), team_members.branch_id));

-- Managers can manage team members in their branch
CREATE POLICY "Managers can manage branch team members"
  ON team_members FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (public.check_user_branch(auth.uid(), team_members.branch_id) 
        AND public.check_user_role(auth.uid(), ARRAY['branch-manager']))
  );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Users can view payments for their bookings
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    payments.booking_id IN (
      SELECT id FROM bookings WHERE created_by = auth.uid()
    )
    OR payments.booking_id IN (
      SELECT id FROM bookings WHERE guest_info->>'email' = public.get_user_email(auth.uid())
    )
  );

-- Staff can view payments in their branch (via bookings)
CREATE POLICY "Staff can view branch payments"
  ON payments FOR SELECT
  USING (
    payments.booking_id IN (
      SELECT id FROM bookings WHERE public.check_user_branch(auth.uid(), bookings.branch_id)
    )
  );

-- Staff can manage payments
CREATE POLICY "Staff can manage payments"
  ON payments FOR ALL
  USING (public.check_user_active(auth.uid()));

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SYSTEM SETTINGS POLICIES
-- =====================================================

-- Super admins can view system settings
CREATE POLICY "Super admins can view system settings"
  ON system_settings FOR SELECT
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager']));

-- Super admins can manage system settings
CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  USING (public.check_user_role(auth.uid(), ARRAY['super-admin']));

-- =====================================================
-- GRANTS FOR PUBLIC ACCESS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on public-facing tables for anonymous users
GRANT SELECT ON branches, rooms, services, menus, news, team_members TO anon;

-- Grant appropriate permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
