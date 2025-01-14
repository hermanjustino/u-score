# U Score

### Schema

-- Create teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    university TEXT NOT NULL,
    varsity_name TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    founded TEXT NOT NULL,
    arena TEXT NOT NULL,
    capacity INTEGER,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women')),
    conference TEXT NOT NULL
);

-- Create players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    position TEXT,
    height TEXT,
    weight TEXT,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women')),
    games_played INTEGER DEFAULT 0,
    points_per_game REAL DEFAULT 0.0,
    field_goal_percentage REAL DEFAULT 0.0,
    three_point_percentage REAL DEFAULT 0.0,
    free_throw_percentage REAL DEFAULT 0.0,
    rebounds_per_game REAL DEFAULT 0.0,
    assists_per_game REAL DEFAULT 0.0,
    steals_per_game REAL DEFAULT 0.0
);

-- Create games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    home_team_score INTEGER,
    away_team_score INTEGER,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women'))
);

-- Create game_stats table
CREATE TABLE game_stats (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    player_id INTEGER REFERENCES players(id),
    points INTEGER,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    three_points_made INTEGER,
    three_points_attempted INTEGER,
    free_throws_made INTEGER,
    free_throws_attempted INTEGER,
    rebounds INTEGER,
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER
);