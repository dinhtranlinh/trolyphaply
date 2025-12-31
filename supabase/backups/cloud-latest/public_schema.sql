--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: cleanup_old_facebook_events(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_facebook_events() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM "facebook_events" WHERE "created_at" < NOW() - INTERVAL '7 days';
END;
$$;


--
-- Name: update_ai_prompts_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_prompts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ai_image_prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_image_prompts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    prompt_template text NOT NULL,
    example_image_url text,
    creator_code character varying(30),
    tags text[] DEFAULT '{}'::text[],
    category character varying(100) NOT NULL,
    likes_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT check_category_valid CHECK (((category)::text = ANY ((ARRAY['Portrait'::character varying, 'Landscape'::character varying, 'Product'::character varying, 'Abstract'::character varying, 'Video'::character varying, 'Interior'::character varying, 'Food'::character varying, 'Business'::character varying, 'Other'::character varying])::text[]))),
    CONSTRAINT check_creator_code_format CHECK (((creator_code IS NULL) OR ((creator_code)::text ~ '^[a-zA-Z0-9_]+$'::text))),
    CONSTRAINT check_creator_code_length CHECK (((creator_code IS NULL) OR ((char_length((creator_code)::text) >= 3) AND (char_length((creator_code)::text) <= 30))))
);


--
-- Name: TABLE ai_image_prompts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_image_prompts IS 'Bảng lưu trữ AI prompts cho tạo ảnh trên Banana';


--
-- Name: COLUMN ai_image_prompts.prompt_template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_image_prompts.prompt_template IS 'Nội dung prompt mẫu để tạo ảnh';


--
-- Name: COLUMN ai_image_prompts.example_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_image_prompts.example_image_url IS 'URL ảnh ví dụ từ Supabase Storage';


--
-- Name: COLUMN ai_image_prompts.creator_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_image_prompts.creator_code IS 'Mã định danh người tạo (optional, NULL = anonymous, 3-30 ký tự, chỉ chữ, số, gạch dưới)';


--
-- Name: app_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_events (
    id bigint NOT NULL,
    app_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    result_id uuid,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: app_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_events_id_seq OWNED BY public.app_events.id;


--
-- Name: app_stats_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_stats_daily (
    app_id uuid NOT NULL,
    date date NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    submits integer DEFAULT 0 NOT NULL,
    shares integer DEFAULT 0 NOT NULL,
    affiliate_clicks integer DEFAULT 0 NOT NULL
);


--
-- Name: apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apps (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) DEFAULT 'other'::character varying NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    type character varying(50) NOT NULL,
    input_schema jsonb NOT NULL,
    prompt_template text NOT NULL,
    output_schema jsonb,
    render_config jsonb,
    share_config jsonb,
    limits jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: auto_message_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_message_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    page_id uuid NOT NULL,
    trigger_on text[] DEFAULT ARRAY['comment'::text],
    message_template text NOT NULL,
    cooldown_minutes integer DEFAULT 1440,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE auto_message_rules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.auto_message_rules IS 'Auto-message (inbox) rules triggered by interactions';


--
-- Name: auto_reply_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_reply_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    page_id uuid NOT NULL,
    post_id character varying(100),
    trigger_type character varying(20) DEFAULT 'all'::character varying,
    keywords text[] DEFAULT ARRAY[]::text[],
    exclude_keywords text[] DEFAULT ARRAY[]::text[],
    reply_templates text[] NOT NULL,
    priority integer DEFAULT 0,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT auto_reply_rules_trigger_type_check CHECK (((trigger_type)::text = ANY ((ARRAY['all'::character varying, 'keyword'::character varying])::text[])))
);


--
-- Name: TABLE auto_reply_rules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.auto_reply_rules IS 'Template-based auto-reply rules (spin syntax supported)';


--
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type character varying(50) NOT NULL,
    page_id character varying(50) NOT NULL,
    post_id character varying(100),
    target_id character varying(100),
    rule_id uuid,
    content_sent text,
    status character varying(20) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT automation_logs_status_check CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::text[])))
);


--
-- Name: TABLE automation_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.automation_logs IS 'Audit trail for all automation actions';


--
-- Name: automation_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type character varying(50) NOT NULL,
    page_id character varying(50) NOT NULL,
    target_id character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    status character varying(20) DEFAULT 'pending'::character varying,
    error text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT automation_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: TABLE automation_queue; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.automation_queue IS 'Delayed job queue (1-5 min random delay)';


--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    priority integer NOT NULL,
    is_enabled boolean DEFAULT true,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE data_sources; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.data_sources IS 'Danh sách nguồn dữ liệu bên ngoài theo thứ tự ưu tiên';


--
-- Name: facebook_connection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facebook_connection (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_access_token text NOT NULL,
    token_expires_at timestamp with time zone,
    scopes text[] DEFAULT ARRAY[]::text[],
    status character varying(20) DEFAULT 'active'::character varying,
    last_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT facebook_connection_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'revoked'::character varying])::text[])))
);


--
-- Name: TABLE facebook_connection; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facebook_connection IS 'Single admin Facebook connection (OAuth token)';


--
-- Name: facebook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facebook_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type character varying(50) NOT NULL,
    page_id character varying(50) NOT NULL,
    post_id character varying(100),
    comment_id character varying(100),
    user_id character varying(50),
    dedupe_key character varying(255) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(20) DEFAULT 'received'::character varying,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT facebook_events_status_check CHECK (((status)::text = ANY ((ARRAY['received'::character varying, 'processed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: TABLE facebook_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facebook_events IS 'Webhook events for deduplication (auto-deleted after 7 days)';


--
-- Name: facebook_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facebook_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id character varying(50) NOT NULL,
    page_name character varying(255) NOT NULL,
    page_access_token text NOT NULL,
    category character varying(100),
    follower_count integer,
    automation_enabled boolean DEFAULT true,
    status character varying(20) DEFAULT 'active'::character varying,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT facebook_pages_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: TABLE facebook_pages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facebook_pages IS 'Facebook Pages managed by admin (minimal info, no content storage)';


--
-- Name: legal_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_documents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    doc_number character varying(100),
    type character varying(100) NOT NULL,
    authority character varying(255) NOT NULL,
    issue_date timestamp without time zone NOT NULL,
    effective_date timestamp without time zone NOT NULL,
    summary text,
    content jsonb NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    category character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: legal_writing_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_writing_styles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    example_content text,
    tone character varying(100),
    characteristics jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE legal_writing_styles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.legal_writing_styles IS 'Lưu trữ các mẫu văn phong viết luật';


--
-- Name: page_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_stats (
    page_id uuid NOT NULL,
    date date NOT NULL,
    comments_total integer DEFAULT 0,
    replies_sent integer DEFAULT 0,
    messages_sent integer DEFAULT 0,
    reactions_total integer DEFAULT 0,
    failed_jobs integer DEFAULT 0
);


--
-- Name: TABLE page_stats; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.page_stats IS 'Daily KPI counters for dashboard';


--
-- Name: procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedures (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    authority character varying(255) NOT NULL,
    time_est character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    steps jsonb NOT NULL,
    documents jsonb NOT NULL,
    fees character varying(255),
    notes text,
    tags text[] DEFAULT '{}'::text[],
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    body text NOT NULL,
    category character varying(100) NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: qa_prompt_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_prompt_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prompt_id uuid,
    version integer NOT NULL,
    system_prompt text NOT NULL,
    formatting_instructions text,
    changed_by character varying(255),
    changed_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE qa_prompt_history; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.qa_prompt_history IS 'Lưu lịch sử thay đổi các phiên bản prompt';


--
-- Name: qa_prompt_writing_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_prompt_writing_styles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prompt_id uuid,
    style_id uuid,
    priority integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE qa_prompt_writing_styles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.qa_prompt_writing_styles IS 'Liên kết giữa prompt và văn phong (many-to-many)';


--
-- Name: qa_prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    system_prompt text NOT NULL,
    formatting_instructions text,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    version integer DEFAULT 1
);


--
-- Name: TABLE qa_prompts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.qa_prompts IS 'Quản lý các prompt cho hệ thống hỏi đáp pháp lý';


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    key character varying(255) NOT NULL,
    count integer DEFAULT 0,
    reset_at timestamp with time zone NOT NULL
);


--
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    app_id uuid NOT NULL,
    input_data jsonb NOT NULL,
    output_data jsonb,
    image_url text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: style_guide_examples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.style_guide_examples (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    style_guide_id uuid NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: style_guides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.style_guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    characteristics text[] DEFAULT '{}'::text[] NOT NULL,
    tone text NOT NULL,
    language text DEFAULT 'vi'::text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE system_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.system_config IS 'Global settings (safe mode, rate limits, etc.)';


--
-- Name: user_cooldowns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_cooldowns (
    page_id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    last_message_at timestamp with time zone NOT NULL
);


--
-- Name: app_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_events ALTER COLUMN id SET DEFAULT nextval('public.app_events_id_seq'::regclass);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: ai_image_prompts ai_image_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_image_prompts
    ADD CONSTRAINT ai_image_prompts_pkey PRIMARY KEY (id);


--
-- Name: app_events app_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_events
    ADD CONSTRAINT app_events_pkey PRIMARY KEY (id);


--
-- Name: app_stats_daily app_stats_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_stats_daily
    ADD CONSTRAINT app_stats_daily_pkey PRIMARY KEY (app_id, date);


--
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- Name: apps apps_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_slug_key UNIQUE (slug);


--
-- Name: auto_message_rules auto_message_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_message_rules
    ADD CONSTRAINT auto_message_rules_pkey PRIMARY KEY (id);


--
-- Name: auto_reply_rules auto_reply_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_reply_rules
    ADD CONSTRAINT auto_reply_rules_pkey PRIMARY KEY (id);


--
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- Name: automation_queue automation_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_queue
    ADD CONSTRAINT automation_queue_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: facebook_connection facebook_connection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facebook_connection
    ADD CONSTRAINT facebook_connection_pkey PRIMARY KEY (id);


--
-- Name: facebook_events facebook_events_dedupe_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facebook_events
    ADD CONSTRAINT facebook_events_dedupe_key_key UNIQUE (dedupe_key);


--
-- Name: facebook_events facebook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facebook_events
    ADD CONSTRAINT facebook_events_pkey PRIMARY KEY (id);


--
-- Name: facebook_pages facebook_pages_page_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facebook_pages
    ADD CONSTRAINT facebook_pages_page_id_key UNIQUE (page_id);


--
-- Name: facebook_pages facebook_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facebook_pages
    ADD CONSTRAINT facebook_pages_pkey PRIMARY KEY (id);


--
-- Name: legal_documents legal_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_pkey PRIMARY KEY (id);


--
-- Name: legal_writing_styles legal_writing_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_writing_styles
    ADD CONSTRAINT legal_writing_styles_pkey PRIMARY KEY (id);


--
-- Name: page_stats page_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_stats
    ADD CONSTRAINT page_stats_pkey PRIMARY KEY (page_id, date);


--
-- Name: procedures procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_pkey PRIMARY KEY (id);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: qa_prompt_history qa_prompt_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_history
    ADD CONSTRAINT qa_prompt_history_pkey PRIMARY KEY (id);


--
-- Name: qa_prompt_writing_styles qa_prompt_writing_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_writing_styles
    ADD CONSTRAINT qa_prompt_writing_styles_pkey PRIMARY KEY (id);


--
-- Name: qa_prompt_writing_styles qa_prompt_writing_styles_prompt_id_style_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_writing_styles
    ADD CONSTRAINT qa_prompt_writing_styles_prompt_id_style_id_key UNIQUE (prompt_id, style_id);


--
-- Name: qa_prompts qa_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompts
    ADD CONSTRAINT qa_prompts_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (key);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: style_guide_examples style_guide_examples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.style_guide_examples
    ADD CONSTRAINT style_guide_examples_pkey PRIMARY KEY (id);


--
-- Name: style_guides style_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.style_guides
    ADD CONSTRAINT style_guides_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (key);


--
-- Name: user_cooldowns user_cooldowns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cooldowns
    ADD CONSTRAINT user_cooldowns_pkey PRIMARY KEY (page_id, user_id);


--
-- Name: idx_ai_prompts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_category ON public.ai_image_prompts USING btree (category);


--
-- Name: idx_ai_prompts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_created_at ON public.ai_image_prompts USING btree (created_at DESC);


--
-- Name: idx_ai_prompts_creator_code_not_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_creator_code_not_null ON public.ai_image_prompts USING btree (creator_code) WHERE (creator_code IS NOT NULL);


--
-- Name: idx_ai_prompts_is_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_is_public ON public.ai_image_prompts USING btree (is_public) WHERE (is_public = true);


--
-- Name: idx_ai_prompts_likes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_likes ON public.ai_image_prompts USING btree (likes_count DESC);


--
-- Name: idx_ai_prompts_views; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_views ON public.ai_image_prompts USING btree (views_count DESC);


--
-- Name: idx_app_events_app_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_events_app_id ON public.app_events USING btree (app_id);


--
-- Name: idx_app_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_events_created_at ON public.app_events USING btree (created_at);


--
-- Name: idx_app_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_events_event_type ON public.app_events USING btree (event_type);


--
-- Name: idx_app_stats_daily_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_stats_daily_date ON public.app_stats_daily USING btree (date);


--
-- Name: idx_apps_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apps_category ON public.apps USING btree (category);


--
-- Name: idx_apps_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apps_slug ON public.apps USING btree (slug);


--
-- Name: idx_apps_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apps_status ON public.apps USING btree (status);


--
-- Name: idx_data_sources_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_sources_priority ON public.data_sources USING btree (priority);


--
-- Name: idx_fb_events_dedupe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fb_events_dedupe ON public.facebook_events USING btree (dedupe_key);


--
-- Name: idx_fb_events_page_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fb_events_page_time ON public.facebook_events USING btree (page_id, created_at);


--
-- Name: idx_fb_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fb_events_status ON public.facebook_events USING btree (status);


--
-- Name: idx_fb_pages_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fb_pages_page_id ON public.facebook_pages USING btree (page_id);


--
-- Name: idx_fb_pages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fb_pages_status ON public.facebook_pages USING btree (status);


--
-- Name: idx_legal_documents_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_documents_category ON public.legal_documents USING btree (category);


--
-- Name: idx_legal_documents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_documents_status ON public.legal_documents USING btree (status);


--
-- Name: idx_legal_documents_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_documents_tags ON public.legal_documents USING gin (tags);


--
-- Name: idx_logs_action_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_action_status ON public.automation_logs USING btree (action_type, status);


--
-- Name: idx_logs_page_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_page_time ON public.automation_logs USING btree (page_id, created_at);


--
-- Name: idx_message_rules_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_rules_page ON public.auto_message_rules USING btree (page_id, enabled);


--
-- Name: idx_page_stats_page_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_stats_page_date ON public.page_stats USING btree (page_id, date);


--
-- Name: idx_procedures_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_category ON public.procedures USING btree (category);


--
-- Name: idx_procedures_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_status ON public.procedures USING btree (status);


--
-- Name: idx_procedures_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_procedures_tags ON public.procedures USING gin (tags);


--
-- Name: idx_prompt_history_prompt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompt_history_prompt ON public.qa_prompt_history USING btree (prompt_id, version);


--
-- Name: idx_prompt_styles_prompt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompt_styles_prompt ON public.qa_prompt_writing_styles USING btree (prompt_id);


--
-- Name: idx_prompts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompts_category ON public.prompts USING btree (category);


--
-- Name: idx_prompts_is_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompts_is_public ON public.prompts USING btree (is_public);


--
-- Name: idx_prompts_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prompts_tags ON public.prompts USING gin (tags);


--
-- Name: idx_qa_prompts_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qa_prompts_active ON public.qa_prompts USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_queue_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_page ON public.automation_queue USING btree (page_id, status);


--
-- Name: idx_queue_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_scheduled ON public.automation_queue USING btree (status, scheduled_at);


--
-- Name: idx_queue_status_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_status_scheduled ON public.automation_queue USING btree (status, scheduled_at);


--
-- Name: idx_reply_rules_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reply_rules_page ON public.auto_reply_rules USING btree (page_id, enabled);


--
-- Name: idx_reply_rules_page_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reply_rules_page_post ON public.auto_reply_rules USING btree (page_id, post_id);


--
-- Name: idx_reply_rules_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reply_rules_post ON public.auto_reply_rules USING btree (page_id, post_id);


--
-- Name: idx_results_app_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_results_app_id ON public.results USING btree (app_id);


--
-- Name: idx_results_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_results_created_at ON public.results USING btree (created_at);


--
-- Name: idx_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stats_date ON public.page_stats USING btree (date);


--
-- Name: idx_style_guide_examples_style_guide_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_style_guide_examples_style_guide_id ON public.style_guide_examples USING btree (style_guide_id);


--
-- Name: idx_style_guides_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_style_guides_is_default ON public.style_guides USING btree (is_default);


--
-- Name: ai_image_prompts trigger_update_ai_prompts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_ai_prompts_updated_at BEFORE UPDATE ON public.ai_image_prompts FOR EACH ROW EXECUTE FUNCTION public.update_ai_prompts_updated_at();


--
-- Name: admin_users update_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: apps update_apps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: auto_message_rules update_auto_message_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_auto_message_rules_updated_at BEFORE UPDATE ON public.auto_message_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: auto_reply_rules update_auto_reply_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_auto_reply_rules_updated_at BEFORE UPDATE ON public.auto_reply_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: facebook_connection update_facebook_connection_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_facebook_connection_updated_at BEFORE UPDATE ON public.facebook_connection FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: facebook_pages update_facebook_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_facebook_pages_updated_at BEFORE UPDATE ON public.facebook_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: legal_documents update_legal_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_legal_documents_updated_at BEFORE UPDATE ON public.legal_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: procedures update_procedures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prompts update_prompts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_config update_system_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: app_events app_events_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_events
    ADD CONSTRAINT app_events_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_events app_events_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_events
    ADD CONSTRAINT app_events_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.results(id) ON DELETE SET NULL;


--
-- Name: app_stats_daily app_stats_daily_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_stats_daily
    ADD CONSTRAINT app_stats_daily_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: auto_message_rules auto_message_rules_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_message_rules
    ADD CONSTRAINT auto_message_rules_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.facebook_pages(id) ON DELETE CASCADE;


--
-- Name: auto_reply_rules auto_reply_rules_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_reply_rules
    ADD CONSTRAINT auto_reply_rules_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.facebook_pages(id) ON DELETE CASCADE;


--
-- Name: page_stats page_stats_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_stats
    ADD CONSTRAINT page_stats_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.facebook_pages(id) ON DELETE CASCADE;


--
-- Name: qa_prompt_history qa_prompt_history_prompt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_history
    ADD CONSTRAINT qa_prompt_history_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.qa_prompts(id) ON DELETE CASCADE;


--
-- Name: qa_prompt_writing_styles qa_prompt_writing_styles_prompt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_writing_styles
    ADD CONSTRAINT qa_prompt_writing_styles_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.qa_prompts(id) ON DELETE CASCADE;


--
-- Name: qa_prompt_writing_styles qa_prompt_writing_styles_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_prompt_writing_styles
    ADD CONSTRAINT qa_prompt_writing_styles_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.legal_writing_styles(id) ON DELETE CASCADE;


--
-- Name: results results_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: style_guide_examples style_guide_examples_style_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.style_guide_examples
    ADD CONSTRAINT style_guide_examples_style_guide_id_fkey FOREIGN KEY (style_guide_id) REFERENCES public.style_guides(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

