-- ============================================================
-- ENACTUS WITS SUPPORT SYSTEM (AltruTech - Iteration 2)
-- Database Triggers & Functions
-- Aligned to actual schema: app_user, announcement, event, report
-- Run AFTER schema.sql and rls_policies.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. AUTH: Auto-provision app_user row on new Supabase Auth sign-up
--    Works for both email/password AND Azure SSO (Entra ID)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the app_user row (idempotent: skip if already exists)
  -- Initially, role_id is NULL (no role assigned yet) and status is 'Pending' (awaiting admin approval)
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
    NULL,
    'Pending',
    CURRENT_DATE
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (fires after every new sign-up / SSO login)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ────────────────────────────────────────────────────────────
-- 2. DOMAIN RESTRICTION: Enforce @students.wits.ac.za on signup
--    This fires BEFORE insert so invalid emails are rejected early
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.validate_signup_domain()
RETURNS TRIGGER AS $$
DECLARE
  user_domain TEXT;
BEGIN
  user_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));

  -- Allow students and staff (wits.ac.za covers all subdomains)
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

-- ────────────────────────────────────────────────────────────
-- 3. REPORTS: Auto-flag late submissions
--    A report is "late" if it is submitted more than 5 days after
--    the first day of the following month (e.g. April report due May 5)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.flag_late_report()
RETURNS TRIGGER AS $$
DECLARE
  period_year  INT;
  period_month INT;
  due_date     DATE;
BEGIN
  -- Parse submission_period as 'YYYY-MM'
  BEGIN
    period_year  := SPLIT_PART(NEW.submission_period, '-', 1)::INT;
    period_month := SPLIT_PART(NEW.submission_period, '-', 2)::INT;
  EXCEPTION WHEN OTHERS THEN
    -- If period is unparseable, skip late check
    RETURN NEW;
  END;

  -- Due date = 5th of the month after the submission period
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
