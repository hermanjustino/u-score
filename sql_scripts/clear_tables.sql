/* psql -U hermanjustino -d usports_basketball -f sql_scripts/clear_tables.sql */

TRUNCATE TABLE game_stats RESTART IDENTITY CASCADE;
TRUNCATE TABLE games RESTART IDENTITY CASCADE;