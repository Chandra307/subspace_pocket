SET check_function_bodies = false;
CREATE TABLE public.accounts (
    id integer NOT NULL,
    accountnumber character varying(50) NOT NULL,
    accounttype character varying(50) NOT NULL,
    balance numeric(15,2) NOT NULL,
    userid integer
);
CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.account_id_seq OWNED BY public.accounts.id;
CREATE TABLE public.transactions (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    accountid integer,
    transactionid character varying(50) NOT NULL,
    status character varying(50) NOT NULL
);
CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;
CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL
);
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);
ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_users FOREIGN KEY (userid) REFERENCES public.users(id);
ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_accountid_fkey FOREIGN KEY (accountid) REFERENCES public.accounts(id);
