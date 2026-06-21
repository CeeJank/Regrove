--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions (
    action_id integer NOT NULL,
    case_id integer NOT NULL,
    hobbies text,
    extra_info text,
    encouragement text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.actions OWNER TO postgres;

--
-- Name: actions_action_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actions_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actions_action_id_seq OWNER TO postgres;

--
-- Name: actions_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actions_action_id_seq OWNED BY public.actions.action_id;


--
-- Name: ai_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_summaries (
    id integer NOT NULL,
    session_id integer NOT NULL,
    summary_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_summaries OWNER TO postgres;

--
-- Name: ai_summaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_summaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_summaries_id_seq OWNER TO postgres;

--
-- Name: ai_summaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_summaries_id_seq OWNED BY public.ai_summaries.id;


--
-- Name: cans_case; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cans_case (
    case_id integer NOT NULL,
    session_id integer NOT NULL,
    youth_id integer NOT NULL,
    worker_id integer,
    cans_domain_id integer NOT NULL,
    cans_item character varying(255) NOT NULL,
    cans_rating smallint,
    rating_label character varying(100),
    case_notes text,
    CONSTRAINT cans_case_cans_rating_check CHECK (((cans_rating >= 0) AND (cans_rating <= 3))),
    CONSTRAINT cans_case_rating_label_check CHECK ((((cans_rating IS NULL) AND (rating_label IS NULL)) OR ((cans_rating = 0) AND ((rating_label)::text = 'No Evidence'::text)) OR ((cans_rating = 1) AND ((rating_label)::text = 'Watch'::text)) OR ((cans_rating = 2) AND ((rating_label)::text = 'Action Needed'::text)) OR ((cans_rating = 3) AND ((rating_label)::text = 'Immediate/Intensive Action'::text))))
);


ALTER TABLE public.cans_case OWNER TO postgres;

--
-- Name: cans_case_case_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cans_case_case_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cans_case_case_id_seq OWNER TO postgres;

--
-- Name: cans_case_case_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cans_case_case_id_seq OWNED BY public.cans_case.case_id;


--
-- Name: cans_domain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cans_domain (
    domain_id integer NOT NULL,
    domain_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cans_domain OWNER TO postgres;

--
-- Name: cans_domain_domain_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cans_domain_domain_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cans_domain_domain_id_seq OWNER TO postgres;

--
-- Name: cans_domain_domain_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cans_domain_domain_id_seq OWNED BY public.cans_domain.domain_id;


--
-- Name: escalations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.escalations (
    id integer NOT NULL,
    session_id integer NOT NULL,
    youth_id integer NOT NULL,
    escalation_type character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT escalations_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('IN_PROGRESS'::character varying)::text, ('RESOLVED'::character varying)::text])))
);


ALTER TABLE public.escalations OWNER TO postgres;

--
-- Name: escalations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.escalations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escalations_id_seq OWNER TO postgres;

--
-- Name: escalations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.escalations_id_seq OWNED BY public.escalations.id;


--
-- Name: handover_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.handover_reports (
    id integer NOT NULL,
    youth_id integer NOT NULL,
    session_id integer NOT NULL,
    summary text NOT NULL,
    recommended_action text,
    reviewed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.handover_reports OWNER TO postgres;

--
-- Name: handover_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.handover_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.handover_reports_id_seq OWNER TO postgres;

--
-- Name: handover_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.handover_reports_id_seq OWNED BY public.handover_reports.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    session_id integer NOT NULL,
    sender_type character varying(20) NOT NULL,
    message_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_sender_type_check CHECK (((sender_type)::text = ANY (ARRAY[('YOUTH'::character varying)::text, ('WORKER'::character varying)::text, ('AI'::character varying)::text])))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: risk_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risk_assessments (
    id integer NOT NULL,
    session_id integer NOT NULL,
    risk_level character varying(20) NOT NULL,
    risk_score numeric(5,2),
    reasoning text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT risk_assessments_risk_level_check CHECK (((risk_level)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('CRITICAL'::character varying)::text])))
);


ALTER TABLE public.risk_assessments OWNER TO postgres;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.risk_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_assessments_id_seq OWNER TO postgres;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.risk_assessments_id_seq OWNED BY public.risk_assessments.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    youth_id integer NOT NULL,
    worker_id integer,
    session_type character varying(30) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ended_at timestamp without time zone,
    CONSTRAINT sessions_session_type_check CHECK (((session_type)::text = ANY (ARRAY[('WORKER_CHAT'::character varying)::text, ('AI_AFTER_HOURS'::character varying)::text]))),
    CONSTRAINT sessions_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('COMPLETED'::character varying)::text, ('ESCALATED'::character varying)::text])))
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('worker'::character varying)::text, ('youth'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: worker_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_notes (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    youth_id integer NOT NULL,
    session_id integer,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.worker_notes OWNER TO postgres;

--
-- Name: worker_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_notes_id_seq OWNER TO postgres;

--
-- Name: worker_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_notes_id_seq OWNED BY public.worker_notes.id;


--
-- Name: worker_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    specialization character varying(255),
    bio text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.worker_profiles OWNER TO postgres;

--
-- Name: worker_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_profiles_id_seq OWNER TO postgres;

--
-- Name: worker_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_profiles_id_seq OWNED BY public.worker_profiles.id;


--
-- Name: worker_youth_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_youth_assignments (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    youth_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.worker_youth_assignments OWNER TO postgres;

--
-- Name: worker_youth_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_youth_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_youth_assignments_id_seq OWNER TO postgres;

--
-- Name: worker_youth_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_youth_assignments_id_seq OWNED BY public.worker_youth_assignments.id;


--
-- Name: youth_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.youth_profiles (
    id integer NOT NULL,
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
    CONSTRAINT youth_profiles_latest_risk_level_check CHECK (((latest_risk_level)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('CRITICAL'::character varying)::text])))
);


ALTER TABLE public.youth_profiles OWNER TO postgres;

--
-- Name: youth_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.youth_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.youth_profiles_id_seq OWNER TO postgres;

--
-- Name: youth_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.youth_profiles_id_seq OWNED BY public.youth_profiles.id;


--
-- Name: actions action_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions ALTER COLUMN action_id SET DEFAULT nextval('public.actions_action_id_seq'::regclass);


--
-- Name: ai_summaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries ALTER COLUMN id SET DEFAULT nextval('public.ai_summaries_id_seq'::regclass);


--
-- Name: cans_case case_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case ALTER COLUMN case_id SET DEFAULT nextval('public.cans_case_case_id_seq'::regclass);


--
-- Name: cans_domain domain_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_domain ALTER COLUMN domain_id SET DEFAULT nextval('public.cans_domain_domain_id_seq'::regclass);


--
-- Name: escalations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalations ALTER COLUMN id SET DEFAULT nextval('public.escalations_id_seq'::regclass);


--
-- Name: handover_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handover_reports ALTER COLUMN id SET DEFAULT nextval('public.handover_reports_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: risk_assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments ALTER COLUMN id SET DEFAULT nextval('public.risk_assessments_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: worker_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_notes ALTER COLUMN id SET DEFAULT nextval('public.worker_notes_id_seq'::regclass);


--
-- Name: worker_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_profiles ALTER COLUMN id SET DEFAULT nextval('public.worker_profiles_id_seq'::regclass);


--
-- Name: worker_youth_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_youth_assignments ALTER COLUMN id SET DEFAULT nextval('public.worker_youth_assignments_id_seq'::regclass);


--
-- Name: youth_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.youth_profiles ALTER COLUMN id SET DEFAULT nextval('public.youth_profiles_id_seq'::regclass);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (action_id);


--
-- Name: ai_summaries ai_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_pkey PRIMARY KEY (id);


--
-- Name: ai_summaries ai_summaries_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_session_id_key UNIQUE (session_id);


--
-- Name: cans_case cans_case_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case
    ADD CONSTRAINT cans_case_pkey PRIMARY KEY (case_id);


--
-- Name: cans_domain cans_domain_domain_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_domain
    ADD CONSTRAINT cans_domain_domain_name_key UNIQUE (domain_name);


--
-- Name: cans_domain cans_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_domain
    ADD CONSTRAINT cans_domain_pkey PRIMARY KEY (domain_id);


--
-- Name: escalations escalations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalations
    ADD CONSTRAINT escalations_pkey PRIMARY KEY (id);


--
-- Name: handover_reports handover_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handover_reports
    ADD CONSTRAINT handover_reports_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: risk_assessments risk_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: worker_notes worker_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_notes
    ADD CONSTRAINT worker_notes_pkey PRIMARY KEY (id);


--
-- Name: worker_profiles worker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_pkey PRIMARY KEY (id);


--
-- Name: worker_profiles worker_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id);


--
-- Name: worker_youth_assignments worker_youth_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_youth_assignments
    ADD CONSTRAINT worker_youth_assignments_pkey PRIMARY KEY (id);


--
-- Name: worker_youth_assignments worker_youth_assignments_worker_id_youth_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_youth_assignments
    ADD CONSTRAINT worker_youth_assignments_worker_id_youth_id_key UNIQUE (worker_id, youth_id);


--
-- Name: youth_profiles youth_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.youth_profiles
    ADD CONSTRAINT youth_profiles_pkey PRIMARY KEY (id);


--
-- Name: youth_profiles youth_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.youth_profiles
    ADD CONSTRAINT youth_profiles_user_id_key UNIQUE (user_id);


--
-- Name: idx_actions_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actions_case ON public.actions USING btree (case_id);


--
-- Name: idx_cans_case_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cans_case_domain ON public.cans_case USING btree (cans_domain_id);


--
-- Name: idx_cans_case_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cans_case_session ON public.cans_case USING btree (session_id);


--
-- Name: idx_cans_case_youth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cans_case_youth ON public.cans_case USING btree (youth_id);


--
-- Name: idx_escalations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_escalations_status ON public.escalations USING btree (status);


--
-- Name: idx_handover_reports_reviewed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_handover_reports_reviewed ON public.handover_reports USING btree (reviewed);


--
-- Name: idx_messages_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_session ON public.messages USING btree (session_id);


--
-- Name: idx_risk_assessments_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_risk_assessments_session ON public.risk_assessments USING btree (session_id);


--
-- Name: idx_sessions_worker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_worker ON public.sessions USING btree (worker_id);


--
-- Name: idx_sessions_youth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_youth ON public.sessions USING btree (youth_id);


--
-- Name: idx_worker_notes_youth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_notes_youth ON public.worker_notes USING btree (youth_id);


--
-- Name: actions actions_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cans_case(case_id) ON DELETE CASCADE;


--
-- Name: ai_summaries ai_summaries_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: cans_case cans_case_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case
    ADD CONSTRAINT cans_case_domain_id_fkey FOREIGN KEY (cans_domain_id) REFERENCES public.cans_domain(domain_id) ON DELETE CASCADE;


--
-- Name: cans_case cans_case_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case
    ADD CONSTRAINT cans_case_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: cans_case cans_case_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case
    ADD CONSTRAINT cans_case_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE SET NULL;


--
-- Name: cans_case cans_case_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cans_case
    ADD CONSTRAINT cans_case_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: escalations escalations_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalations
    ADD CONSTRAINT escalations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: escalations escalations_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalations
    ADD CONSTRAINT escalations_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: handover_reports handover_reports_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handover_reports
    ADD CONSTRAINT handover_reports_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: handover_reports handover_reports_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handover_reports
    ADD CONSTRAINT handover_reports_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: risk_assessments risk_assessments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: worker_notes worker_notes_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_notes
    ADD CONSTRAINT worker_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;


--
-- Name: worker_notes worker_notes_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_notes
    ADD CONSTRAINT worker_notes_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE;


--
-- Name: worker_notes worker_notes_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_notes
    ADD CONSTRAINT worker_notes_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: worker_profiles worker_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: worker_youth_assignments worker_youth_assignments_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_youth_assignments
    ADD CONSTRAINT worker_youth_assignments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_profiles(id) ON DELETE CASCADE;


--
-- Name: worker_youth_assignments worker_youth_assignments_youth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_youth_assignments
    ADD CONSTRAINT worker_youth_assignments_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;


--
-- Name: youth_profiles youth_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.youth_profiles
    ADD CONSTRAINT youth_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Table structure for table public.events
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    organizer_id integer
);

ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.events_id_seq OWNER TO postgres;
ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;
ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);
ALTER TABLE ONLY public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.events ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.worker_profiles(id) ON DELETE SET NULL;


--
-- Table structure for table public.event_youth_invites
--

CREATE TABLE public.event_youth_invites (
    id integer NOT NULL,
    event_id integer NOT NULL,
    youth_id integer NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    CONSTRAINT event_youth_invites_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('ACCEPTED'::character varying)::text, ('DECLINED'::character varying)::text, ('CONFIRMED'::character varying)::text])))
);

ALTER TABLE public.event_youth_invites OWNER TO postgres;

--
-- Name: event_youth_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_youth_invites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.event_youth_invites_id_seq OWNER TO postgres;
ALTER SEQUENCE public.event_youth_invites_id_seq OWNED BY public.event_youth_invites.id;
ALTER TABLE ONLY public.event_youth_invites ALTER COLUMN id SET DEFAULT nextval('public.event_youth_invites_id_seq'::regclass);
ALTER TABLE ONLY public.event_youth_invites ADD CONSTRAINT event_youth_invites_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.event_youth_invites ADD CONSTRAINT event_youth_invites_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.event_youth_invites ADD CONSTRAINT event_youth_invites_youth_id_fkey FOREIGN KEY (youth_id) REFERENCES public.youth_profiles(id) ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
--

--\unrestrict Xw38GQynBLFJJDswg0reqrOFvcne1OTXIwq2Xidxzp6n3fRled8fhTVqKeMPPiz

