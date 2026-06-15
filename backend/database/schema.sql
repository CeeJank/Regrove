-- environment clean-up execution script
DROP TABLE IF EXISTS public.handover_reports CASCADE;
DROP TABLE IF EXISTS public.worker_notes CASCADE;
DROP TABLE IF EXISTS public.escalations CASCADE;
DROP TABLE IF EXISTS public.risk_assessments CASCADE;
DROP TABLE IF EXISTS public.ai_summaries CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.worker_youth_assignments CASCADE;
DROP TABLE IF EXISTS public.youth_profiles CASCADE;
DROP TABLE IF EXISTS public.worker_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Core Users Table (Authentication Base)
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email CHARACTER VARYING(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role CHARACTER VARYING(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK ((role::text = ANY (ARRAY['worker'::text, 'youth'::text, 'admin'::text])))
);

-- 2. Worker Profiles Table
CREATE TABLE public.worker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name CHARACTER VARYING(255) NOT NULL,
    specialization CHARACTER VARYING(255),
    bio TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Youth Profiles Table
CREATE TABLE public.youth_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name CHARACTER VARYING(255) NOT NULL,
    profile_picture TEXT,
    status CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
    age INTEGER,
    school CHARACTER VARYING(255),
    interests TEXT,
    category CHARACTER VARYING(255),
    latest_risk_level CHARACTER VARYING(20) DEFAULT 'LOW'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT youth_profiles_latest_risk_level_check CHECK ((latest_risk_level::text = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'CRITICAL'::text])))
);

-- 4. Worker-Youth Link Matrix Table
CREATE TABLE public.worker_youth_assignments (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    youth_id INTEGER NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT worker_youth_assignments_worker_id_youth_id_key UNIQUE (worker_id, youth_id)
);

-- 5. Chat Interaction Container (Sessions Table)
CREATE TABLE public.sessions (
    id SERIAL PRIMARY KEY,
    youth_id INTEGER NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES public.worker_profiles(id) ON DELETE SET NULL,
    session_type CHARACTER VARYING(30) NOT NULL,
    status CHARACTER VARYING(20) DEFAULT 'ACTIVE'::character varying,
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT sessions_session_type_check CHECK ((session_type::text = ANY (ARRAY['WORKER_CHAT'::text, 'AI_AFTER_HOURS'::text]))),
    CONSTRAINT sessions_status_check CHECK ((status::text = ANY (ARRAY['ACTIVE'::text, 'COMPLETED'::text, 'ESCALATED'::text])))
);

-- 6. Individual Transcript Messages Lines Table
CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_type CHARACTER VARYING(20) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_sender_type_check CHECK ((sender_type::text = ANY (ARRAY['YOUTH'::text, 'WORKER'::text, 'AI'::text])))
);

-- 7. Automated LLM Summarization Block Table
CREATE TABLE public.ai_summaries (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Safety & Sentiment Evaluative Record Table (With explicit tracking values integrated!)
CREATE TABLE public.risk_assessments (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
    risk_level CHARACTER VARYING(20) NOT NULL,
    risk_score NUMERIC(5,2),
    reasoning TEXT,
    sentiment_positive INTEGER DEFAULT 0,
    sentiment_neutral INTEGER DEFAULT 0,
    sentiment_negative INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT risk_assessments_risk_level_check CHECK ((risk_level::text = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'CRITICAL'::text])))
);

-- 9. Real-Time Emergency Escalation Log Table
CREATE TABLE public.escalations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    youth_id INTEGER NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    escalation_type CHARACTER VARYING(100) NOT NULL,
    description TEXT,
    status CHARACTER VARYING(20) DEFAULT 'PENDING'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT escalations_status_check CHECK ((status::text = ANY (ARRAY['PENDING'::text, 'IN_PROGRESS'::text, 'RESOLVED'::text])))
);

-- 10. Manual Case File Observations Table
CREATE TABLE public.worker_notes (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    youth_id INTEGER NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES public.sessions(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Duty Transition Handover Documentation Table
CREATE TABLE public.handover_reports (
    id SERIAL PRIMARY KEY,
    youth_id INTEGER NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    recommended_action TEXT,
    reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Index Layer
CREATE INDEX idx_messages_session ON public.messages USING btree (session_id);
CREATE INDEX idx_risk_assessments_session ON public.risk_assessments USING btree (session_id);
CREATE INDEX idx_sessions_worker ON public.sessions USING btree (worker_id);
CREATE INDEX idx_sessions_youth ON public.sessions USING btree (youth_id);
CREATE INDEX idx_escalations_status ON public.escalations USING btree (status);
CREATE INDEX idx_handover_reports_reviewed ON public.handover_reports USING btree (reviewed);
CREATE INDEX idx_worker_notes_youth ON public.worker_notes USING btree (youth_id);