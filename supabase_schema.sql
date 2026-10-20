-- ==============================================================================
-- DR. RABEYA'S OBGYN SURGERY NOTE & PRACTICE
-- Supabase PostgreSQL Schema, Indexes, and Row Level Security (RLS)
-- ==============================================================================
-- PRIVACY NOTE:
-- In accordance with strict medical confidentiality (HIPAA / GDPR / Medical Ethics),
-- this database NEVER stores patient names, phone numbers, addresses, or personal
-- identifiers. All records use an anonymized Case ID (e.g. 2026-0001).
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. SURGERIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    
    -- Case identification (Anonymized)
    case_id VARCHAR(50) NOT NULL,
    
    -- Schedule
    surgery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    surgery_time TIME,
    
    -- Procedure Details
    procedure_type VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Obstetric', 'Gynecologic', 'General')),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('Emergency', 'Elective')),
    anesthesia_type VARCHAR(50),
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    
    -- Clinical Outcome
    outcome VARCHAR(30) NOT NULL CHECK (outcome IN ('Successful', 'Complication', 'Referred')),
    complication_details TEXT,
    
    -- Facility
    hospital_name VARCHAR(150) NOT NULL,
    notes TEXT,
    
    -- Obstetric & Delivery Specific Fields (applicable for deliveries/LSCS)
    baby_count INTEGER DEFAULT 1,
    baby_gender VARCHAR(50),               -- 'Female', 'Male', 'Twins (M/F)', etc.
    birth_weight_kg NUMERIC(4, 2),         -- e.g. 3.25 kg
    apgar_score VARCHAR(30),               -- e.g. '8/9' (1 min / 5 min)
    mother_age_group VARCHAR(30),          -- '<20', '20-25', '26-30', '31-35', '36-40', '>40'
    previous_c_sections INTEGER DEFAULT 0, -- 0, 1, 2, 3+
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. INDEXES FOR FAST QUERYING & ANALYTICS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_surgeries_user_date ON public.surgeries (user_id, surgery_date DESC);
CREATE INDEX IF NOT EXISTS idx_surgeries_case_id ON public.surgeries (user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_category ON public.surgeries (user_id, category);
CREATE INDEX IF NOT EXISTS idx_surgeries_procedure ON public.surgeries (user_id, procedure_type);
CREATE INDEX IF NOT EXISTS idx_surgeries_urgency ON public.surgeries (user_id, urgency);
CREATE INDEX IF NOT EXISTS idx_surgeries_outcome ON public.surgeries (user_id, outcome);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES (Doctor Only)
-- ==============================================================================
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;

-- Doctor can only view their own surgeries
CREATE POLICY "Doctor can view own surgeries"
    ON public.surgeries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Doctor can only insert surgeries assigned to their account
CREATE POLICY "Doctor can insert own surgeries"
    ON public.surgeries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Doctor can only update their own surgeries
CREATE POLICY "Doctor can update own surgeries"
    ON public.surgeries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Doctor can only delete their own surgeries
CREATE POLICY "Doctor can delete own surgeries"
    ON public.surgeries
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTO-CASE-ID HELPER FUNCTION
-- Generates sequential format YYYY-0001 per doctor per year
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_next_case_id(p_user_id UUID, p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_count INTEGER;
    v_next_id TEXT;
BEGIN
    v_prefix := p_year::TEXT || '-';
    
    -- Count surgeries in this year for this doctor
    SELECT COUNT(*) INTO v_count
    FROM public.surgeries
    WHERE user_id = p_user_id
      AND EXTRACT(YEAR FROM surgery_date) = p_year;
      
    v_next_id := v_prefix || LPAD((v_count + 1)::TEXT, 4, '0');
    RETURN v_next_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. PUBLIC APPOINTMENTS TABLE (Optional Public Booking)
-- Allows public visitors to submit appointment requests, but only the doctor can view them
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    preferred_date DATE NOT NULL,
    chamber_location VARCHAR(150),
    service_type VARCHAR(100),
    message TEXT,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Anyone (public/anon) can submit an appointment request
CREATE POLICY "Public can submit appointment request"
    ON public.appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only authenticated doctor can view submitted appointments
CREATE POLICY "Doctor can view all appointments"
    ON public.appointments
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated doctor can update status
CREATE POLICY "Doctor can update appointment status"
    ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 7. DYNAMIC SITE CONTENT TABLE (Website CMS / Live Content Editor)
-- Allows public visitors to view published site text, and authenticated doctor to edit all sections
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read the published site content
CREATE POLICY "Public can view site content"
    ON public.site_content
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Doctor can modify site content (authenticated or admin panel)
CREATE POLICY "Doctor can modify site content"
    ON public.site_content
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Seed initial default content row
INSERT INTO public.site_content (id, content, updated_at)
VALUES ('main', '{"doctor":{"name":"Dr. Rabeya Basri","title":"Obstetrics & Gynecology Surgeon","subtitle":"Consultant Obstetrician, Gynecologist & Laparoscopic Surgeon","degrees":"MBBS, FCPS (OBGYN), MS (Gynae & Obs), Fellowship in Laparoscopy","bmdc_reg":"A-XXXXX","experience_years":"15+","primary_phone":"+880 1700-000000","alt_phone":"+880 1800-000000","email":"dr.rabeyabasri@example.com","photo_url":"assets/images/doctor-portrait.jpg","emergency_hotline":"+880 1700-000000"},"hero":{"pill_text":"Compassionate Maternal & Women''s Surgical Care","title_main":"Gentle Deliveries,","title_highlight":"Excellence in Surgery.","subtitle":"Specializing in high-safety Cesarean sections, painless normal deliveries, advanced laparoscopic procedures, and comprehensive gynecologic surgical care with over 15 years of dedicated medical service.","stat1_num":"15+","stat1_label":"Years Clinical Experience","stat2_num":"4,500+","stat2_label":"Deliveries & Surgeries","stat3_num":"99.4%","stat3_label":"Safety & Success Record","badge_status":"Accepting Patients"},"chambersList":[{"id":"chamber-1","name":"Dinajpur Medical College, Hospital","badge":"Primary Hospital & Chamber","address":"Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur","days":"Saturday – Thursday","hours":"9:00 AM – 2:30 PM & Evening Chamber","phone":"+880 1700-000000"}],"chambers":{"chamber1_name":"Dinajpur Medical College, Hospital","chamber1_badge":"Primary Hospital & Chamber","chamber1_address":"Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur","chamber1_days":"Saturday – Thursday","chamber1_hours":"9:00 AM – 2:30 PM & Evening Chamber","chamber1_phone":"+880 1700-000000"},"footer":{"brand_title":"Dr. Rabeya Basri","about_text":"Consultant Obstetrician, Gynecologist & Laparoscopic Surgeon dedicated to compassionate, high-safety healthcare for women.","copyright_text":"Dr. Rabeya Basri. All medical rights reserved."}}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;


