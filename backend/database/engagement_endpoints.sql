-- =====================================================
-- GLADS Hotel Management System - Additional Endpoints Schema
-- Adds: testimonials, feedback, special_offers, contact_messages
-- NOTE:
--   1) Run backend/database/schema.sql first.
--   2) This script reuses helper functions defined there:
--      public.check_user_role, public.check_user_branch, public.check_user_active.
-- =====================================================

-- =====================================================
-- 1. TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_role VARCHAR(255),
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'google', 'booking', 'direct', 'other')),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_branch_active ON testimonials(branch_id, is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, display_order);

-- =====================================================
-- 2. FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('stay', 'service', 'facility', 'staff', 'other')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in-review', 'resolved', 'archived')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_branch_status ON feedback(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);

-- =====================================================
-- 3. SPECIAL OFFERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL DEFAULT 'branch-specific' CHECK (scope IN ('global', 'branch-specific')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cta_text VARCHAR(100),
  cta_link TEXT,
  promo_code VARCHAR(100),
  discount_percentage DECIMAL(5, 2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount DECIMAL(12, 2) CHECK (discount_amount >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ,
  terms_and_conditions TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'expired')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (valid_to IS NULL OR valid_to >= valid_from),
  CHECK (
    (scope = 'global' AND branch_id IS NULL)
    OR (scope = 'branch-specific' AND branch_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_special_offers_branch_status ON special_offers(branch_id, status, is_active);
CREATE INDEX IF NOT EXISTS idx_special_offers_validity ON special_offers(valid_from DESC, valid_to);
CREATE INDEX IF NOT EXISTS idx_special_offers_featured ON special_offers(is_featured);

-- =====================================================
-- 4. CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  preferred_contact_method VARCHAR(50) DEFAULT 'any' CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp', 'any')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved', 'spam', 'archived')),
  internal_note TEXT,
  response TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_branch_status ON contact_messages(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_testimonials_updated_at') THEN
      CREATE TRIGGER update_testimonials_updated_at
      BEFORE UPDATE ON testimonials
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feedback_updated_at') THEN
      CREATE TRIGGER update_feedback_updated_at
      BEFORE UPDATE ON feedback
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_special_offers_updated_at') THEN
      CREATE TRIGGER update_special_offers_updated_at
      BEFORE UPDATE ON special_offers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_messages_updated_at') THEN
      CREATE TRIGGER update_contact_messages_updated_at
      BEFORE UPDATE ON contact_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TESTIMONIALS POLICIES
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Allow public to view active testimonials" ON testimonials;
CREATE POLICY "Allow public to view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Staff can view branch testimonials" ON testimonials;
CREATE POLICY "Staff can view branch testimonials"
  ON testimonials FOR SELECT
  USING (public.check_user_branch(auth.uid(), testimonials.branch_id));

DROP POLICY IF EXISTS "Managers can manage branch testimonials" ON testimonials;
CREATE POLICY "Managers can manage branch testimonials"
  ON testimonials FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      public.check_user_branch(auth.uid(), testimonials.branch_id)
      AND public.check_user_role(auth.uid(), ARRAY['branch-manager'])
    )
  );

-- -----------------------------------------------------
-- FEEDBACK POLICIES
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Allow public to submit feedback" ON feedback;
CREATE POLICY "Allow public to submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (is_active = true);

DROP POLICY IF EXISTS "Staff can view feedback" ON feedback;
CREATE POLICY "Staff can view feedback"
  ON feedback FOR SELECT
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      feedback.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), feedback.branch_id)
    )
  );

DROP POLICY IF EXISTS "Staff can manage feedback" ON feedback;
CREATE POLICY "Staff can manage feedback"
  ON feedback FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      feedback.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), feedback.branch_id)
      AND public.check_user_role(auth.uid(), ARRAY['branch-manager', 'receptionist'])
    )
  );

-- -----------------------------------------------------
-- SPECIAL OFFERS POLICIES
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Allow public to view active special offers" ON special_offers;
CREATE POLICY "Allow public to view active special offers"
  ON special_offers FOR SELECT
  USING (
    is_active = true
    AND status = 'active'
    AND valid_from <= NOW()
    AND (valid_to IS NULL OR valid_to >= NOW())
  );

DROP POLICY IF EXISTS "Staff can view branch and global special offers" ON special_offers;
CREATE POLICY "Staff can view branch and global special offers"
  ON special_offers FOR SELECT
  USING (
    special_offers.scope = 'global'
    OR public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      special_offers.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), special_offers.branch_id)
    )
  );

DROP POLICY IF EXISTS "Managers can manage branch special offers" ON special_offers;
CREATE POLICY "Managers can manage branch special offers"
  ON special_offers FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      special_offers.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), special_offers.branch_id)
      AND public.check_user_role(auth.uid(), ARRAY['branch-manager'])
    )
  );

-- -----------------------------------------------------
-- CONTACT MESSAGES POLICIES
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Allow public to submit contact messages" ON contact_messages;
CREATE POLICY "Allow public to submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (is_active = true);

DROP POLICY IF EXISTS "Staff can view contact messages" ON contact_messages;
CREATE POLICY "Staff can view contact messages"
  ON contact_messages FOR SELECT
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      contact_messages.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), contact_messages.branch_id)
    )
  );

DROP POLICY IF EXISTS "Staff can manage contact messages" ON contact_messages;
CREATE POLICY "Staff can manage contact messages"
  ON contact_messages FOR ALL
  USING (
    public.check_user_role(auth.uid(), ARRAY['super-admin', 'super-manager'])
    OR (
      contact_messages.branch_id IS NOT NULL
      AND public.check_user_branch(auth.uid(), contact_messages.branch_id)
      AND public.check_user_role(auth.uid(), ARRAY['branch-manager', 'receptionist'])
    )
  );

-- =====================================================
-- GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON testimonials, special_offers TO anon;
GRANT INSERT ON feedback, contact_messages TO anon;
GRANT ALL ON testimonials, feedback, special_offers, contact_messages TO authenticated;

-- =====================================================
-- END OF ADDITIONAL SCHEMA
-- =====================================================
