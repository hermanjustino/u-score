--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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
-- Name: game_stats; Type: TABLE; Schema: public; Owner: hermanjustino
--

CREATE TABLE public.game_stats (
    id integer NOT NULL,
    game_id integer,
    player_id integer,
    points integer,
    field_goals_made integer,
    field_goals_attempted integer,
    three_points_made integer,
    three_points_attempted integer,
    free_throws_made integer,
    free_throws_attempted integer,
    rebounds integer,
    assists integer,
    steals integer,
    blocks integer
);


ALTER TABLE public.game_stats OWNER TO hermanjustino;

--
-- Name: game_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: hermanjustino
--

CREATE SEQUENCE public.game_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_stats_id_seq OWNER TO hermanjustino;

--
-- Name: game_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hermanjustino
--

ALTER SEQUENCE public.game_stats_id_seq OWNED BY public.game_stats.id;


--
-- Name: games; Type: TABLE; Schema: public; Owner: hermanjustino
--

CREATE TABLE public.games (
    id integer NOT NULL,
    date date NOT NULL,
    home_team_id integer,
    away_team_id integer,
    home_team_score integer,
    away_team_score integer,
    gender text NOT NULL,
    is_conference_game boolean DEFAULT true,
    status text DEFAULT 'scheduled'::text,
    is_exhibition boolean DEFAULT false,
    is_overtime boolean DEFAULT false,
    CONSTRAINT games_gender_check CHECK ((gender = ANY (ARRAY['men'::text, 'women'::text]))),
    CONSTRAINT games_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'final'::text])))
);


ALTER TABLE public.games OWNER TO hermanjustino;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: hermanjustino
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.games_id_seq OWNER TO hermanjustino;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hermanjustino
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: player_game_stats; Type: TABLE; Schema: public; Owner: hermanjustino
--

CREATE TABLE public.player_game_stats (
    id integer NOT NULL,
    player_id integer,
    game_id integer,
    minutes_played integer,
    points integer DEFAULT 0,
    field_goals_made integer DEFAULT 0,
    field_goals_attempted integer DEFAULT 0,
    three_points_made integer DEFAULT 0,
    three_points_attempted integer DEFAULT 0,
    free_throws_made integer DEFAULT 0,
    free_throws_attempted integer DEFAULT 0,
    offensive_rebounds integer DEFAULT 0,
    defensive_rebounds integer DEFAULT 0,
    total_rebounds integer DEFAULT 0,
    assists integer DEFAULT 0,
    turnovers integer DEFAULT 0,
    steals integer DEFAULT 0,
    blocks integer DEFAULT 0,
    personal_fouls integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.player_game_stats OWNER TO hermanjustino;

--
-- Name: player_game_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: hermanjustino
--

CREATE SEQUENCE public.player_game_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.player_game_stats_id_seq OWNER TO hermanjustino;

--
-- Name: player_game_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hermanjustino
--

ALTER SEQUENCE public.player_game_stats_id_seq OWNED BY public.player_game_stats.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: hermanjustino
--

CREATE TABLE public.players (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    team_id integer,
    jersey_number character varying(10),
    "position" character varying(20),
    year_of_eligibility integer,
    hometown character varying(100),
    province text,
    height_cm integer,
    weight_kg integer,
    previous_school character varying(100),
    academic_program text,
    photo_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    usports_player_id character varying(100),
    academic_year character varying(10),
    height character varying(10),
    CONSTRAINT players_year_of_eligibility_check CHECK (((year_of_eligibility >= 1) AND (year_of_eligibility <= 5)))
);


ALTER TABLE public.players OWNER TO hermanjustino;

--
-- Name: player_season_stats; Type: VIEW; Schema: public; Owner: hermanjustino
--

CREATE VIEW public.player_season_stats AS
 SELECT p.id,
    p.first_name,
    p.last_name,
    p.team_id,
    count(DISTINCT pgs.game_id) AS games_played,
    sum(pgs.points) AS total_points,
    sum(pgs.field_goals_made) AS total_fgm,
    sum(pgs.field_goals_attempted) AS total_fga,
    sum(pgs.three_points_made) AS total_3pm,
    sum(pgs.three_points_attempted) AS total_3pa,
    sum(pgs.free_throws_made) AS total_ftm,
    sum(pgs.free_throws_attempted) AS total_fta,
    sum(pgs.offensive_rebounds) AS total_offensive_rebounds,
    sum(pgs.defensive_rebounds) AS total_defensive_rebounds,
    sum(pgs.total_rebounds) AS total_rebounds,
    sum(pgs.assists) AS total_assists,
    sum(pgs.turnovers) AS total_turnovers,
    sum(pgs.steals) AS total_steals,
    sum(pgs.blocks) AS total_blocks,
    sum(pgs.personal_fouls) AS total_fouls,
    round(avg(pgs.points), 1) AS ppg,
    round(avg(pgs.total_rebounds), 1) AS rpg,
    round(avg(pgs.assists), 1) AS apg,
    round(
        CASE
            WHEN (sum(pgs.field_goals_attempted) > 0) THEN (((sum(pgs.field_goals_made))::numeric / (sum(pgs.field_goals_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS fg_percentage,
    round(
        CASE
            WHEN (sum(pgs.three_points_attempted) > 0) THEN (((sum(pgs.three_points_made))::numeric / (sum(pgs.three_points_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS three_point_percentage,
    round(
        CASE
            WHEN (sum(pgs.free_throws_attempted) > 0) THEN (((sum(pgs.free_throws_made))::numeric / (sum(pgs.free_throws_attempted))::numeric) * (100)::numeric)
            ELSE (0)::numeric
        END, 1) AS ft_percentage
   FROM (public.players p
     LEFT JOIN public.player_game_stats pgs ON ((p.id = pgs.player_id)))
  GROUP BY p.id, p.first_name, p.last_name, p.team_id;


ALTER TABLE public.player_season_stats OWNER TO hermanjustino;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: hermanjustino
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.players_id_seq OWNER TO hermanjustino;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hermanjustino
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: hermanjustino
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    university text NOT NULL,
    varsity_name text NOT NULL,
    city text NOT NULL,
    province text NOT NULL,
    founded text NOT NULL,
    arena text NOT NULL,
    capacity integer,
    gender text NOT NULL,
    conference text NOT NULL,
    division text,
    logo bytea,
    sport text DEFAULT 'basketball'::text NOT NULL,
    short_name character varying(50),
    website_key character varying(50),
    usports_id character varying(32),
    lookup_key character varying(50),
    CONSTRAINT teams_new_gender_check CHECK ((gender = ANY (ARRAY['men'::text, 'women'::text])))
);


ALTER TABLE public.teams OWNER TO hermanjustino;

--
-- Name: team_standings; Type: VIEW; Schema: public; Owner: hermanjustino
--

CREATE VIEW public.team_standings AS
 WITH game_results AS (
         SELECT games.home_team_id AS team_id,
            games.gender,
            games.is_conference_game,
            count(*) AS games_played,
            sum(
                CASE
                    WHEN (games.home_team_score > games.away_team_score) THEN 1
                    ELSE 0
                END) AS wins,
            sum(
                CASE
                    WHEN (games.home_team_score < games.away_team_score) THEN 1
                    ELSE 0
                END) AS losses,
            sum(games.home_team_score) AS points_for,
            sum(games.away_team_score) AS points_against
           FROM public.games
          WHERE (games.status = 'final'::text)
          GROUP BY games.home_team_id, games.gender, games.is_conference_game
        UNION ALL
         SELECT games.away_team_id AS team_id,
            games.gender,
            games.is_conference_game,
            count(*) AS games_played,
            sum(
                CASE
                    WHEN (games.away_team_score > games.home_team_score) THEN 1
                    ELSE 0
                END) AS wins,
            sum(
                CASE
                    WHEN (games.away_team_score < games.home_team_score) THEN 1
                    ELSE 0
                END) AS losses,
            sum(games.away_team_score) AS points_for,
            sum(games.home_team_score) AS points_against
           FROM public.games
          WHERE (games.status = 'final'::text)
          GROUP BY games.away_team_id, games.gender, games.is_conference_game
        )
 SELECT t.id,
    t.university,
    t.varsity_name,
    t.conference,
    t.division,
    t.gender,
    conf.games_played AS conference_games,
    conf.wins AS conference_wins,
    conf.losses AS conference_losses,
    nonconf.games_played AS total_games,
    nonconf.wins AS total_wins,
    nonconf.losses AS total_losses,
    conf.points_for AS conference_points_for,
    conf.points_against AS conference_points_against
   FROM ((public.teams t
     LEFT JOIN ( SELECT game_results.team_id,
            game_results.gender,
            game_results.is_conference_game,
            game_results.games_played,
            game_results.wins,
            game_results.losses,
            game_results.points_for,
            game_results.points_against
           FROM game_results
          WHERE (game_results.is_conference_game = true)) conf ON (((t.id = conf.team_id) AND (t.gender = conf.gender))))
     LEFT JOIN ( SELECT game_results.team_id,
            game_results.gender,
            game_results.is_conference_game,
            game_results.games_played,
            game_results.wins,
            game_results.losses,
            game_results.points_for,
            game_results.points_against
           FROM game_results
          WHERE (game_results.is_conference_game = false)) nonconf ON (((t.id = nonconf.team_id) AND (t.gender = nonconf.gender))))
  ORDER BY t.conference, t.division, COALESCE(((conf.wins)::numeric / (NULLIF(conf.games_played, 0))::numeric), (0)::numeric) DESC;


ALTER TABLE public.team_standings OWNER TO hermanjustino;

--
-- Name: teams_new_id_seq; Type: SEQUENCE; Schema: public; Owner: hermanjustino
--

CREATE SEQUENCE public.teams_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_new_id_seq OWNER TO hermanjustino;

--
-- Name: teams_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hermanjustino
--

ALTER SEQUENCE public.teams_new_id_seq OWNED BY public.teams.id;


--
-- Name: game_stats id; Type: DEFAULT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.game_stats ALTER COLUMN id SET DEFAULT nextval('public.game_stats_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: player_game_stats id; Type: DEFAULT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.player_game_stats ALTER COLUMN id SET DEFAULT nextval('public.player_game_stats_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_new_id_seq'::regclass);


--
-- Name: game_stats game_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT game_stats_pkey PRIMARY KEY (id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: player_game_stats player_game_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_pkey PRIMARY KEY (id);


--
-- Name: player_game_stats player_game_stats_player_id_game_id_key; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_player_id_game_id_key UNIQUE (player_id, game_id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: players players_team_id_jersey_number_key; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_jersey_number_key UNIQUE (team_id, jersey_number);


--
-- Name: players players_usports_player_id_key; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_usports_player_id_key UNIQUE (usports_player_id);


--
-- Name: teams teams_new_pkey; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_new_pkey PRIMARY KEY (id);


--
-- Name: games unique_game_date_teams; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT unique_game_date_teams UNIQUE (home_team_id, away_team_id, date);


--
-- Name: teams unique_varsity_name_gender; Type: CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT unique_varsity_name_gender UNIQUE (varsity_name, gender);


--
-- Name: idx_players_team_id; Type: INDEX; Schema: public; Owner: hermanjustino
--

CREATE INDEX idx_players_team_id ON public.players USING btree (team_id);


--
-- Name: idx_players_usports_player_id; Type: INDEX; Schema: public; Owner: hermanjustino
--

CREATE INDEX idx_players_usports_player_id ON public.players USING btree (usports_player_id);


--
-- Name: game_stats game_stats_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT game_stats_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: games games_away_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id);


--
-- Name: games games_home_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id);


--
-- Name: player_game_stats player_game_stats_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: player_game_stats player_game_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermanjustino
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- PostgreSQL database dump complete
--

