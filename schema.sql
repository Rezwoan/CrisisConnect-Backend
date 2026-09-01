--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: admin_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_status_enum AS ENUM (
    'ACTIVE',
    'ON_LEAVE',
    'SUSPENDED'
);


--
-- Name: application_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: assignment_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assignment_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: crisis_severity_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crisis_severity_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: crisis_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crisis_status_enum AS ENUM (
    'ACTIVE',
    'CONTAINED',
    'RESOLVED'
);


--
-- Name: donation_call_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.donation_call_status_enum AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: donation_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.donation_status_enum AS ENUM (
    'INITIATED',
    'PAID',
    'FAILED'
);


--
-- Name: otp_purpose_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.otp_purpose_enum AS ENUM (
    'SIGNUP',
    'LOGIN'
);


--
-- Name: payment_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status_enum AS ENUM (
    'SUCCESS',
    'FAILED'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'ADMIN',
    'NGO',
    'VOLUNTEER',
    'DONOR'
);


--
-- Name: volunteer_call_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.volunteer_call_status_enum AS ENUM (
    'OPEN',
    'CLOSED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    "fullName" character varying(60) NOT NULL,
    phone bigint NOT NULL,
    city character varying(40) NOT NULL,
    age integer NOT NULL,
    status public.admin_status_enum NOT NULL,
    "userId" integer,
    "profileImage" character varying(255)
);


--
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- Name: announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement (
    id integer NOT NULL,
    title character varying(120) NOT NULL,
    body text NOT NULL,
    "isUrgent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "adminId" integer
);


--
-- Name: announcement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcement_id_seq OWNED BY public.announcement.id;


--
-- Name: announcement_recipient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement_recipient (
    "announcementId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application (
    id integer NOT NULL,
    message character varying(300) NOT NULL,
    status public.application_status_enum DEFAULT 'PENDING'::public.application_status_enum NOT NULL,
    "appliedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "volunteerId" integer,
    "volunteerCallId" integer
);


--
-- Name: application_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_id_seq OWNED BY public.application.id;


--
-- Name: assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment (
    id integer NOT NULL,
    "roleTitle" character varying(60) NOT NULL,
    status public.assignment_status_enum DEFAULT 'ACTIVE'::public.assignment_status_enum NOT NULL,
    "assignedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "applicationId" integer,
    "ngoId" integer
);


--
-- Name: assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignment_id_seq OWNED BY public.assignment.id;


--
-- Name: crisis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crisis (
    id integer NOT NULL,
    title character varying(120) NOT NULL,
    description text NOT NULL,
    category character varying(40) NOT NULL,
    severity public.crisis_severity_enum NOT NULL,
    status public.crisis_status_enum DEFAULT 'ACTIVE'::public.crisis_status_enum NOT NULL,
    city character varying(40) NOT NULL,
    "declaredAt" timestamp without time zone DEFAULT now() NOT NULL,
    "declaredByAdminId" integer
);


--
-- Name: crisis_follow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crisis_follow (
    "donorId" integer NOT NULL,
    "crisisId" integer NOT NULL
);


--
-- Name: crisis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crisis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crisis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crisis_id_seq OWNED BY public.crisis.id;


--
-- Name: crisis_participation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crisis_participation (
    "ngoId" integer NOT NULL,
    "crisisId" integer NOT NULL
);


--
-- Name: donation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donation (
    id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    message character varying(200) NOT NULL,
    status public.donation_status_enum DEFAULT 'INITIATED'::public.donation_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "donorId" integer,
    "donationCallId" integer
);


--
-- Name: donation_call; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donation_call (
    id integer NOT NULL,
    title character varying(120) NOT NULL,
    description text NOT NULL,
    "targetAmount" numeric(12,2) NOT NULL,
    "raisedAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status public.donation_call_status_enum DEFAULT 'OPEN'::public.donation_call_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "ngoId" integer,
    "crisisId" integer
);


--
-- Name: donation_call_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donation_call_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donation_call_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donation_call_id_seq OWNED BY public.donation_call.id;


--
-- Name: donation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donation_id_seq OWNED BY public.donation.id;


--
-- Name: donor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donor (
    id integer NOT NULL,
    "uniqueId" character varying(150) NOT NULL,
    "fullName" character varying(60) NOT NULL,
    city character varying(40) NOT NULL,
    country character varying(30) DEFAULT 'Unknown'::character varying NOT NULL,
    "joiningDate" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer,
    "profileImage" character varying(255)
);


--
-- Name: donor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donor_id_seq OWNED BY public.donor.id;


--
-- Name: ngo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ngo (
    id integer NOT NULL,
    "orgName" character varying(100) NOT NULL,
    "regNumber" character varying(60) NOT NULL,
    "fullName" character varying(60),
    phone character varying(11) NOT NULL,
    city character varying(40) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "userId" integer,
    "profileImage" character varying(255)
);


--
-- Name: ngo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ngo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ngo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ngo_id_seq OWNED BY public.ngo.id;


--
-- Name: otp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp (
    id integer NOT NULL,
    "codeHash" character varying(200) NOT NULL,
    purpose public.otp_purpose_enum NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


--
-- Name: otp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_id_seq OWNED BY public.otp.id;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment (
    id integer NOT NULL,
    "cardLast4" character varying(4) NOT NULL,
    status public.payment_status_enum NOT NULL,
    "attemptedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "donationId" integer
);


--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- Name: receipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipt (
    id integer NOT NULL,
    "receiptNo" character varying(40) NOT NULL,
    amount numeric(12,2) NOT NULL,
    "issuedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "paymentId" integer
);


--
-- Name: receipt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.receipt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: receipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.receipt_id_seq OWNED BY public.receipt.id;


--
-- Name: skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill (
    id integer NOT NULL,
    name character varying(40) NOT NULL
);


--
-- Name: skill_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_id_seq OWNED BY public.skill.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    "passwordHash" character varying(200) NOT NULL,
    role public.user_role_enum NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: volunteer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer (
    id integer NOT NULL,
    username character varying(40) NOT NULL,
    "fullName" character varying(60) NOT NULL,
    phone bigint NOT NULL,
    city character varying(40) NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "totalHours" integer DEFAULT 0 NOT NULL,
    "userId" integer,
    "profileImage" character varying(255)
);


--
-- Name: volunteer_call; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_call (
    id integer NOT NULL,
    title character varying(120) NOT NULL,
    description text NOT NULL,
    slots integer NOT NULL,
    status public.volunteer_call_status_enum DEFAULT 'OPEN'::public.volunteer_call_status_enum NOT NULL,
    city character varying(40) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "ngoId" integer,
    "crisisId" integer
);


--
-- Name: volunteer_call_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_call_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_call_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_call_id_seq OWNED BY public.volunteer_call.id;


--
-- Name: volunteer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_id_seq OWNED BY public.volunteer.id;


--
-- Name: volunteer_skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_skill (
    "volunteerId" integer NOT NULL,
    "skillId" integer NOT NULL
);


--
-- Name: work_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_log (
    id integer NOT NULL,
    hours integer NOT NULL,
    note character varying(300) NOT NULL,
    "loggedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "assignmentId" integer
);


--
-- Name: work_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_log_id_seq OWNED BY public.work_log.id;


--
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- Name: announcement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement ALTER COLUMN id SET DEFAULT nextval('public.announcement_id_seq'::regclass);


--
-- Name: application id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application ALTER COLUMN id SET DEFAULT nextval('public.application_id_seq'::regclass);


--
-- Name: assignment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment ALTER COLUMN id SET DEFAULT nextval('public.assignment_id_seq'::regclass);


--
-- Name: crisis id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis ALTER COLUMN id SET DEFAULT nextval('public.crisis_id_seq'::regclass);


--
-- Name: donation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation ALTER COLUMN id SET DEFAULT nextval('public.donation_id_seq'::regclass);


--
-- Name: donation_call id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation_call ALTER COLUMN id SET DEFAULT nextval('public.donation_call_id_seq'::regclass);


--
-- Name: donor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donor ALTER COLUMN id SET DEFAULT nextval('public.donor_id_seq'::regclass);


--
-- Name: ngo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ngo ALTER COLUMN id SET DEFAULT nextval('public.ngo_id_seq'::regclass);


--
-- Name: otp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp ALTER COLUMN id SET DEFAULT nextval('public.otp_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- Name: receipt id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipt ALTER COLUMN id SET DEFAULT nextval('public.receipt_id_seq'::regclass);


--
-- Name: skill id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill ALTER COLUMN id SET DEFAULT nextval('public.skill_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: volunteer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer ALTER COLUMN id SET DEFAULT nextval('public.volunteer_id_seq'::regclass);


--
-- Name: volunteer_call id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_call ALTER COLUMN id SET DEFAULT nextval('public.volunteer_call_id_seq'::regclass);


--
-- Name: work_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_log ALTER COLUMN id SET DEFAULT nextval('public.work_log_id_seq'::regclass);


--
-- Name: crisis_follow PK_22b38c11fd7f9441bdbb32d6f5f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_follow
    ADD CONSTRAINT "PK_22b38c11fd7f9441bdbb32d6f5f" PRIMARY KEY ("donorId", "crisisId");


--
-- Name: donation PK_25fb5a541964bc5cfc18fb13a82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation
    ADD CONSTRAINT "PK_25fb5a541964bc5cfc18fb13a82" PRIMARY KEY (id);


--
-- Name: otp PK_32556d9d7b22031d7d0e1fd6723; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY (id);


--
-- Name: crisis PK_41ae40298d25cee7111828d06f9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis
    ADD CONSTRAINT "PK_41ae40298d25cee7111828d06f9" PRIMARY KEY (id);


--
-- Name: assignment PK_43c2f5a3859f54cedafb270f37e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "PK_43c2f5a3859f54cedafb270f37e" PRIMARY KEY (id);


--
-- Name: donation_call PK_49b8a5a8594518ba80ef57d6e8b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation_call
    ADD CONSTRAINT "PK_49b8a5a8594518ba80ef57d6e8b" PRIMARY KEY (id);


--
-- Name: donor PK_51f7b00d1120f7130b69f8a3a46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donor
    ADD CONSTRAINT "PK_51f7b00d1120f7130b69f8a3a46" PRIMARY KEY (id);


--
-- Name: application PK_569e0c3e863ebdf5f2408ee1670; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY (id);


--
-- Name: work_log PK_65e2816b0d0876024e3754656b9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_log
    ADD CONSTRAINT "PK_65e2816b0d0876024e3754656b9" PRIMARY KEY (id);


--
-- Name: volunteer PK_76924da1998b3e07025e04c4d3c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer
    ADD CONSTRAINT "PK_76924da1998b3e07025e04c4d3c" PRIMARY KEY (id);


--
-- Name: crisis_participation PK_7b4cc9b24623d0ce627cccb01ee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_participation
    ADD CONSTRAINT "PK_7b4cc9b24623d0ce627cccb01ee" PRIMARY KEY ("ngoId", "crisisId");


--
-- Name: skill PK_a0d33334424e64fb78dc3ce7196; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY (id);


--
-- Name: receipt PK_b4b9ec7d164235fbba023da9832; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "PK_b4b9ec7d164235fbba023da9832" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: announcement_recipient PK_cfead0baad3e161cf91439a1a62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_recipient
    ADD CONSTRAINT "PK_cfead0baad3e161cf91439a1a62" PRIMARY KEY ("announcementId", "userId");


--
-- Name: ngo PK_da3e13acb48ce5a2e7146f71a25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ngo
    ADD CONSTRAINT "PK_da3e13acb48ce5a2e7146f71a25" PRIMARY KEY (id);


--
-- Name: admin PK_e032310bcef831fb83101899b10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY (id);


--
-- Name: announcement PK_e0ef0550174fd1099a308fd18a0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT "PK_e0ef0550174fd1099a308fd18a0" PRIMARY KEY (id);


--
-- Name: volunteer_skill PK_f12182db994e600190d6b48b8bc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skill
    ADD CONSTRAINT "PK_f12182db994e600190d6b48b8bc" PRIMARY KEY ("volunteerId", "skillId");


--
-- Name: volunteer_call PK_f344c2c1e3f75264f3dabb43ad1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_call
    ADD CONSTRAINT "PK_f344c2c1e3f75264f3dabb43ad1" PRIMARY KEY (id);


--
-- Name: payment PK_fcaec7df5adf9cac408c686b2ab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY (id);


--
-- Name: donor REL_1066cb3fd61d250765bba26acc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donor
    ADD CONSTRAINT "REL_1066cb3fd61d250765bba26acc" UNIQUE ("userId");


--
-- Name: receipt REL_3d1ed14396424884ea1f7c3ee9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "REL_3d1ed14396424884ea1f7c3ee9" UNIQUE ("paymentId");


--
-- Name: ngo REL_3f595bb12db865d7e37fbf8aec; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ngo
    ADD CONSTRAINT "REL_3f595bb12db865d7e37fbf8aec" UNIQUE ("userId");


--
-- Name: volunteer REL_b448933d82c256ea1addbca731; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer
    ADD CONSTRAINT "REL_b448933d82c256ea1addbca731" UNIQUE ("userId");


--
-- Name: payment REL_bc16d7c930014d8e3694fb1a20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "REL_bc16d7c930014d8e3694fb1a20" UNIQUE ("donationId");


--
-- Name: assignment REL_f272559e93859f6f8761285bbf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "REL_f272559e93859f6f8761285bbf" UNIQUE ("applicationId");


--
-- Name: admin REL_f8a889c4362d78f056960ca6da; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "REL_f8a889c4362d78f056960ca6da" UNIQUE ("userId");


--
-- Name: skill UQ_0f49a593960360f6f85b692aca8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT "UQ_0f49a593960360f6f85b692aca8" UNIQUE (name);


--
-- Name: volunteer UQ_842c8cfb6ffbaa7693e30724385; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer
    ADD CONSTRAINT "UQ_842c8cfb6ffbaa7693e30724385" UNIQUE (username);


--
-- Name: receipt UQ_9c1d2d394a589df29ea86a36edd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "UQ_9c1d2d394a589df29ea86a36edd" UNIQUE ("receiptNo");


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: IDX_0d9f44ec170042c77e2324aedb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0d9f44ec170042c77e2324aedb" ON public.crisis_follow USING btree ("crisisId");


--
-- Name: IDX_39bdffff35e97de8dc0dc7096a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_39bdffff35e97de8dc0dc7096a" ON public.crisis_follow USING btree ("donorId");


--
-- Name: IDX_7380797ab7b580352a9527d929; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7380797ab7b580352a9527d929" ON public.crisis_participation USING btree ("ngoId");


--
-- Name: IDX_7e0c54b9ff69a9c57d9707d558; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7e0c54b9ff69a9c57d9707d558" ON public.volunteer_skill USING btree ("skillId");


--
-- Name: IDX_ae8d4a1fc6f028c31e5a094239; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ae8d4a1fc6f028c31e5a094239" ON public.announcement_recipient USING btree ("userId");


--
-- Name: IDX_d08802c808c64c4e771bb35a7d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d08802c808c64c4e771bb35a7d" ON public.announcement_recipient USING btree ("announcementId");


--
-- Name: IDX_f9dbeb6fc718b25fc7ca053ab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f9dbeb6fc718b25fc7ca053ab0" ON public.crisis_participation USING btree ("crisisId");


--
-- Name: IDX_fe5cdba5cefc50c0ded2aa1dad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fe5cdba5cefc50c0ded2aa1dad" ON public.volunteer_skill USING btree ("volunteerId");


--
-- Name: crisis_follow FK_0d9f44ec170042c77e2324aedb1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_follow
    ADD CONSTRAINT "FK_0d9f44ec170042c77e2324aedb1" FOREIGN KEY ("crisisId") REFERENCES public.crisis(id);


--
-- Name: donor FK_1066cb3fd61d250765bba26accb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donor
    ADD CONSTRAINT "FK_1066cb3fd61d250765bba26accb" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: announcement FK_390a8dccfc6adcd5ad7391b81e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT "FK_390a8dccfc6adcd5ad7391b81e4" FOREIGN KEY ("adminId") REFERENCES public.admin(id);


--
-- Name: crisis_follow FK_39bdffff35e97de8dc0dc7096a0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_follow
    ADD CONSTRAINT "FK_39bdffff35e97de8dc0dc7096a0" FOREIGN KEY ("donorId") REFERENCES public.donor(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipt FK_3d1ed14396424884ea1f7c3ee91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "FK_3d1ed14396424884ea1f7c3ee91" FOREIGN KEY ("paymentId") REFERENCES public.payment(id);


--
-- Name: ngo FK_3f595bb12db865d7e37fbf8aecb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ngo
    ADD CONSTRAINT "FK_3f595bb12db865d7e37fbf8aecb" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: donation FK_4270be6abda43b0f63bfb068d1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation
    ADD CONSTRAINT "FK_4270be6abda43b0f63bfb068d1a" FOREIGN KEY ("donationCallId") REFERENCES public.donation_call(id);


--
-- Name: crisis FK_46cdc6033199fe21fbc9be37ee5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis
    ADD CONSTRAINT "FK_46cdc6033199fe21fbc9be37ee5" FOREIGN KEY ("declaredByAdminId") REFERENCES public.admin(id);


--
-- Name: donation FK_5f345add82fd6c572f306449cb7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation
    ADD CONSTRAINT "FK_5f345add82fd6c572f306449cb7" FOREIGN KEY ("donorId") REFERENCES public.donor(id);


--
-- Name: crisis_participation FK_7380797ab7b580352a9527d9293; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_participation
    ADD CONSTRAINT "FK_7380797ab7b580352a9527d9293" FOREIGN KEY ("ngoId") REFERENCES public.ngo(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: volunteer_call FK_742e3e2ff29348d027121b6cb34; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_call
    ADD CONSTRAINT "FK_742e3e2ff29348d027121b6cb34" FOREIGN KEY ("crisisId") REFERENCES public.crisis(id);


--
-- Name: volunteer_skill FK_7e0c54b9ff69a9c57d9707d5582; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skill
    ADD CONSTRAINT "FK_7e0c54b9ff69a9c57d9707d5582" FOREIGN KEY ("skillId") REFERENCES public.skill(id);


--
-- Name: assignment FK_90a1ad93f4dcd7fb5a9393b67b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "FK_90a1ad93f4dcd7fb5a9393b67b2" FOREIGN KEY ("ngoId") REFERENCES public.ngo(id);


--
-- Name: announcement_recipient FK_ae8d4a1fc6f028c31e5a094239c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_recipient
    ADD CONSTRAINT "FK_ae8d4a1fc6f028c31e5a094239c" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: volunteer FK_b448933d82c256ea1addbca731f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer
    ADD CONSTRAINT "FK_b448933d82c256ea1addbca731f" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: payment FK_bc16d7c930014d8e3694fb1a20f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "FK_bc16d7c930014d8e3694fb1a20f" FOREIGN KEY ("donationId") REFERENCES public.donation(id);


--
-- Name: donation_call FK_be063798d540e5bf9a0cd2f49b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation_call
    ADD CONSTRAINT "FK_be063798d540e5bf9a0cd2f49b2" FOREIGN KEY ("ngoId") REFERENCES public.ngo(id);


--
-- Name: work_log FK_be1acab27b0d762daafd0711313; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_log
    ADD CONSTRAINT "FK_be1acab27b0d762daafd0711313" FOREIGN KEY ("assignmentId") REFERENCES public.assignment(id);


--
-- Name: donation_call FK_c96cec31e5797433ff4dc229350; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donation_call
    ADD CONSTRAINT "FK_c96cec31e5797433ff4dc229350" FOREIGN KEY ("crisisId") REFERENCES public.crisis(id);


--
-- Name: volunteer_call FK_cb7476bd429342ff21ae7cbb5ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_call
    ADD CONSTRAINT "FK_cb7476bd429342ff21ae7cbb5ed" FOREIGN KEY ("ngoId") REFERENCES public.ngo(id);


--
-- Name: application FK_cc59f90459d858a6d203eef6ae7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT "FK_cc59f90459d858a6d203eef6ae7" FOREIGN KEY ("volunteerId") REFERENCES public.volunteer(id);


--
-- Name: announcement_recipient FK_d08802c808c64c4e771bb35a7d7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_recipient
    ADD CONSTRAINT "FK_d08802c808c64c4e771bb35a7d7" FOREIGN KEY ("announcementId") REFERENCES public.announcement(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application FK_da7db8aa99e4bd7720e3e00d75b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT "FK_da7db8aa99e4bd7720e3e00d75b" FOREIGN KEY ("volunteerCallId") REFERENCES public.volunteer_call(id);


--
-- Name: otp FK_db724db1bc3d94ad5ba38518433; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT "FK_db724db1bc3d94ad5ba38518433" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: assignment FK_f272559e93859f6f8761285bbf0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT "FK_f272559e93859f6f8761285bbf0" FOREIGN KEY ("applicationId") REFERENCES public.application(id);


--
-- Name: admin FK_f8a889c4362d78f056960ca6dad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: crisis_participation FK_f9dbeb6fc718b25fc7ca053ab01; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crisis_participation
    ADD CONSTRAINT "FK_f9dbeb6fc718b25fc7ca053ab01" FOREIGN KEY ("crisisId") REFERENCES public.crisis(id);


--
-- Name: volunteer_skill FK_fe5cdba5cefc50c0ded2aa1dad3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skill
    ADD CONSTRAINT "FK_fe5cdba5cefc50c0ded2aa1dad3" FOREIGN KEY ("volunteerId") REFERENCES public.volunteer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


