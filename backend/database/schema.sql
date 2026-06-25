-- Clean Database Schema Initialization Script with Drop Handlers

-- ============================================================================
-- 1. DROP HANDLERS (Ordered by dependency to avoid constraint failure)
-- ============================================================================
DROP TABLE IF EXISTS public.worker_notes CASCADE;
DROP TABLE IF EXISTS public.risk_assessments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.handover_reports CASCADE;
DROP TABLE IF EXISTS public.escalations CASCADE;
DROP TABLE IF EXISTS public.actions CASCADE;
DROP TABLE IF EXISTS public.cans_case CASCADE;
DROP TABLE IF EXISTS public.cans_domain CASCADE;
DROP TABLE IF EXISTS public.ai_summaries CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.worker_youth_assignments CASCADE;
DROP TABLE IF EXISTS public.youth_profiles CASCADE;
DROP TABLE IF EXISTS public.worker_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- 2. TABLE CREATION SECRETS (Ordered logically by dependency)
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('worker'::character varying)::text, ('youth'::character varying)::text, ('admin'::character varying)::text])))
);

-- 2. WORKER PROFILES TABLE (Depends on users)
CREATE TABLE public.worker_profiles (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    specialization character varying(255),
    bio text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT worker_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. YOUTH PROFILES TABLE (Depends on users)
CREATE TABLE public.youth_profiles (
    id SERIAL PRIMARY KEY,
    user_id integer,
    full_name character varying(255) NOT NULL,
    profile_picture text,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    age integer,
    school character varying(255),
    interests text,
    category character varying(255),
    latest_risk_level character varying(20) DEFAULT 'LOW'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT youth_profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT youth_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT youth_profiles_latest_risk_level_check CHECK (((latest_risk_level)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('CRITICAL'::character varying)::text])))
);

-- 4. WORKER YOUTH ASSIGNMENTS TABLE (Depends on worker_profiles, youth_profiles)
CREATE TABLE public.worker_youth_assignments (
    id SERIAL PRIMARY KEY,
    worker_id integer NOT NULL,
    youth_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT worker_youth_assignments_worker_id_youth_id_key UNIQUE (worker_id, youth_id),
    CONSTRAINT worker_youth_assignments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    CONSTRAINT worker_youth_assignments_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE
);

-- 5. SESSIONS TABLE (Depends on worker_profiles, youth_profiles)
CREATE TABLE public.sessions (
    id SERIAL PRIMARY KEY,
    youth_id integer NOT NULL,
    worker_id integer,
    session_type character varying(30) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ended_at timestamp without time zone,
    CONSTRAINT sessions_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    CONSTRAINT sessions_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE SET NULL,
    CONSTRAINT sessions_session_type_check CHECK (((session_type)::text = ANY (ARRAY[('WORKER_CHAT'::character varying)::text, ('AI_AFTER_HOURS'::character varying)::text]))),
    CONSTRAINT sessions_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('COMPLETED'::character varying)::text, ('ESCALATED'::character varying)::text])))
);

-- 6. AI SUMMARIES TABLE (Depends on sessions)
CREATE TABLE public.ai_summaries (
    id SERIAL PRIMARY KEY,
    session_id integer NOT NULL,
    summary_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ai_summaries_session_id_key UNIQUE (session_id),
    CONSTRAINT ai_summaries_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE
);

-- 7. CANS DOMAIN TABLE
CREATE TABLE public.cans_domain (
    domain_id SERIAL PRIMARY KEY,
    domain_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cans_domain_domain_name_key UNIQUE (domain_name)
);

-- 8. CANS CASE TABLE (Depends on sessions, youth_profiles, worker_profiles, cans_domain)
CREATE TABLE public.cans_case (
    case_id SERIAL PRIMARY KEY,
    session_id integer NOT NULL,
    youth_id integer NOT NULL,
    worker_id integer,
    cans_domain_id integer NOT NULL,
    cans_item character varying(255) NOT NULL,
    cans_rating smallint,
    rating_label character varying(100),
    case_notes text,
    CONSTRAINT cans_case_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
    CONSTRAINT cans_case_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    CONSTRAINT cans_case_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE SET NULL,
    CONSTRAINT cans_case_domain_id_fkey FOREIGN KEY (cans_domain_id) REFERENCES public.cans_domain(domain_id) ON DELETE CASCADE,
    CONSTRAINT cans_case_cans_rating_check CHECK (((cans_rating >= 0) AND (cans_rating <= 3))),
    CONSTRAINT cans_case_rating_label_check CHECK ((((cans_rating IS NULL) AND (rating_label IS NULL)) OR ((cans_rating = 0) AND ((rating_label)::text = 'No Evidence'::text)) OR ((cans_rating = 1) AND ((rating_label)::text = 'Watch'::text)) OR ((cans_rating = 2) AND ((rating_label)::text = 'Action Needed'::text)) OR ((cans_rating = 3) AND ((rating_label)::text = 'Immediate/Intensive Action'::text))))
);

-- 9. ACTIONS TABLE (Depends on cans_case)
CREATE TABLE public.actions (
    action_id SERIAL PRIMARY KEY,
    case_id integer NOT NULL,
    hobbies text,
    extra_info text,
    encouragement text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT actions_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cans_case(case_id) ON DELETE CASCADE
);

-- 10. ESCALATIONS TABLE (Depends on sessions, youth_profiles)
CREATE TABLE public.escalations (
    id SERIAL PRIMARY KEY,
    session_id integer NOT NULL,
    youth_id integer NOT NULL,
    escalation_type character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT escalations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
    CONSTRAINT escalations_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    CONSTRAINT escalations_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('IN_PROGRESS'::character varying)::text, ('RESOLVED'::character varying)::text])))
);

-- 11. HANDOVER REPORTS TABLE (Depends on sessions, youth_profiles)
CREATE TABLE public.handover_reports (
    id SERIAL PRIMARY KEY,
    youth_id integer NOT NULL,
    session_id integer NOT NULL,
    summary text NOT NULL,
    recommended_action text,
    reviewed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT handover_reports_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
    CONSTRAINT handover_reports_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE
);

-- 12. MESSAGES TABLE (Depends on sessions)
CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    session_id integer NOT NULL,
    sender_type character varying(20) NOT NULL,
    message_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_type_check CHECK (((sender_type)::text = ANY (ARRAY[('YOUTH'::character varying)::text, ('WORKER'::character varying)::text, ('AI'::character varying)::text])))
);

-- 13. RISK ASSESSMENTS TABLE (Depends on sessions)
CREATE TABLE public.risk_assessments (
    id SERIAL PRIMARY KEY,
    session_id integer NOT NULL,
    risk_level character varying(20) NOT NULL,
    risk_score numeric(5,2),
    reasoning text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT risk_assessments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE,
    CONSTRAINT risk_assessments_risk_level_check CHECK (((risk_level)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('CRITICAL'::character varying)::text])))
);

-- 14. WORKER NOTES TABLE (Depends on sessions, worker_profiles, youth_profiles)
CREATE TABLE public.worker_notes (
    id SERIAL PRIMARY KEY,
    worker_id integer NOT NULL,
    youth_id integer NOT NULL,
    session_id integer,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT worker_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL,
    CONSTRAINT worker_notes_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    CONSTRAINT worker_notes_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_actions_case ON public.actions USING btree (case_id);
CREATE INDEX idx_cans_case_domain ON public.cans_case USING btree (cans_domain_id);
CREATE INDEX idx_cans_case_session ON public.cans_case USING btree (session_id);
CREATE INDEX idx_cans_case_youth ON public.cans_case USING btree (youth_id);
CREATE INDEX idx_escalations_status ON public.escalations USING btree (status);
CREATE INDEX idx_handover_reports_reviewed ON public.handover_reports USING btree (reviewed);
CREATE INDEX idx_messages_session ON public.messages USING btree (session_id);
CREATE INDEX idx_risk_assessments_session ON public.risk_assessments USING btree (session_id);
CREATE INDEX idx_sessions_worker ON public.sessions USING btree (worker_id);
CREATE INDEX idx_sessions_youth ON public.sessions USING btree (youth_id);
CREATE INDEX idx_worker_notes_youth ON public.worker_notes USING btree (youth_id);