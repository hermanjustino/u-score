/* psql -U hermanjustino -d usports_basketball -f sql_scripts/sample_game_data.sql */

INSERT INTO games (date, home_team_id, away_team_id, home_team_score, away_team_score, gender, status, is_conference_game) VALUES
-- Conference games
('2024-01-10', 1, 2, 75, 68, 'women', 'final', true),
('2024-01-15', 3, 4, 82, 79, 'women', 'final', true),
('2024-01-15', 5, 6, 89, 79, 'women', 'final', true),

('2024-01-20', 1, 6, 88, 85, 'women', 'final', true),
('2024-01-21', 3, 2, 88, 85, 'women', 'final', true),
('2024-01-22', 5, 4, 88, 85, 'women', 'final', true),


('2024-01-25', 1, 4, 88, 85, 'women', 'final', true),
('2024-01-25', 3, 6, 88, 85, 'women', 'final', true),
('2024-01-25', 5, 2, 88, 85, 'women', 'final', true);


-- Non-conference games