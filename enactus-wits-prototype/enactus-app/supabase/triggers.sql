-- ============================================================
-- ENACTUS WITS SUPPORT SYSTEM (AltruTech - Iteration 2)
-- Database Triggers & Functions
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. UTILITY: Automatically update updated_at timestamp
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 2. AUTH: Enforce Email Domain Restriction
-- ────────────────────────────────────────────────────────────
-- Validates that signing up users belong to an active allowed domain (e.g., @students.wits.ac.za or @wits.ac.za)
CREATE OR REPLACE FUNCTION public.validate_signup_domain()
RETURNS TRIGGER AS $$
DECLARE
    user_domain TEXT;
    is_domain_allowed BOOLEAN;
BEGIN
    -- Extract domain from email (everything after @)
    user_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));

    -- Check if domain exists in active allowed_domains table
    SELECT EXISTS (
        SELECT 1 FROM public.allowed_domains
        WHERE LOWER(domain) = user_domain AND is_active = TRUE
    ) INTO is_domain_allowed;

    IF NOT is_domain_allowed THEN
        RAISE EXCEPTION 'Access restricted: Only verified @students.wits.ac.za (or authorized university domains) accounts may register.'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS trg_validate_signup_domain ON auth.users;
CREATE TRIGGER trg_validate_signup_domain
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.validate_signup_domain();

-- ────────────────────────────────────────────────────────────
-- 3. PROFILE AUTO-PROVISIONING
-- ────────────────────────────────────────────────────────────
-- Creates public.profiles record when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_domain TEXT;
    assigned_role_id INT := 1; -- Default to Member
BEGIN
    user_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));

    -- Determine default role from allowed_domains configuration
    SELECT COALESCE(role_id, 1) INTO assigned_role_id
    FROM public.allowed_domains
    WHERE LOWER(domain) = user_domain AND is_active = TRUE
    LIMIT 1;

    -- Check if role was specified in raw_user_meta_data (e.g. during admin setup)
    IF NEW.raw_user_meta_data->>'role_id' IS NOT NULL THEN
        assigned_role_id := (NEW.raw_user_meta_data->>'role_id')::INT;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        student_number,
        phone,
        bio,
        business_idea,
        status,
        role_id,
        business_stage_id,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'student_number',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'business_idea',
        'Active',
        assigned_role_id,
        (NEW.raw_user_meta_data->>'business_stage_id')::INT,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;
CREATE TRIGGER trg_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
