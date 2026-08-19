-- ============================================================
-- ENACTUS WITS — MIGRATION PATCH
-- Run this in Supabase SQL Editor on an EXISTING database.
-- This applies ONLY the changes made since the initial schema was deployed.
-- Safe to run: all statements use IF NOT EXISTS / OR REPLACE / DO NOTHING
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ANNOUNCEMENT: Add 'pinned' column (was missing from original schema)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.announcement
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

-- ────────────────────────────────────────────────────────────
-- 2. APP_USER: Relax email domain constraint to also allow @wits.ac.za
--    (Faculty Advisors and Admins may use @wits.ac.za)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.app_user
  DROP CONSTRAINT IF EXISTS chk_wits_email_domain;

ALTER TABLE public.app_user
  ADD CONSTRAINT chk_wits_email_domain
  CHECK (
    wits_email LIKE '%@students.wits.ac.za'
    OR wits_email LIKE '%@wits.ac.za'
  );

-- ────────────────────────────────────────────────────────────
-- 3. TRIGGERS: Replace with corrected versions
--    (Original triggers.sql referenced wrong table names)
-- ────────────────────────────────────────────────────────────

-- 3a. Auto-provision app_user on new auth sign-up (email/password + Azure SSO)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id bigint;
BEGIN
  SELECT role_id INTO default_role_id
  FROM public.role
  WHERE role_name = 'Member'
  LIMIT 1;

  INSERT INTO public.app_user (
    auth_user_id,
    full_name,
    wits_email,
    role_id,
    account_status,
    join_date
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.email,
    default_role_id,
    'Active',
    CURRENT_DATE
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3b. Domain validation: block non-Wits emails at auth layer
CREATE OR REPLACE FUNCTION public.validate_signup_domain()
RETURNS TRIGGER AS $$
DECLARE
  user_domain TEXT;
BEGIN
  user_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));

  IF user_domain NOT IN ('students.wits.ac.za', 'wits.ac.za') THEN
    RAISE EXCEPTION 'Access restricted: Only @students.wits.ac.za or @wits.ac.za accounts may register.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_signup_domain ON auth.users;
CREATE TRIGGER trg_validate_signup_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.validate_signup_domain();

-- 3c. Auto-flag late report submissions
CREATE OR REPLACE FUNCTION public.flag_late_report()
RETURNS TRIGGER AS $$
DECLARE
  period_year  INT;
  period_month INT;
  due_date     DATE;
BEGIN
  BEGIN
    period_year  := SPLIT_PART(NEW.submission_period, '-', 1)::INT;
    period_month := SPLIT_PART(NEW.submission_period, '-', 2)::INT;
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
  END;

  due_date := MAKE_DATE(
    CASE WHEN period_month = 12 THEN period_year + 1 ELSE period_year END,
    CASE WHEN period_month = 12 THEN 1 ELSE period_month + 1 END,
    5
  );

  NEW.is_late := (CURRENT_DATE > due_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flag_late_report ON public.report;
CREATE TRIGGER trg_flag_late_report
  BEFORE INSERT ON public.report
  FOR EACH ROW EXECUTE FUNCTION public.flag_late_report();

-- ────────────────────────────────────────────────────────────
-- 4. VERIFY: Quick sanity check — shows existing tables
-- ────────────────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
