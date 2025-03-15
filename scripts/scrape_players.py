import requests
from bs4 import BeautifulSoup
import psycopg2
import time
import sys
from datetime import datetime

def get_team_usports_ids(conn):
    """Get all teams with their usports_id from the database"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, university, gender, usports_id FROM teams WHERE usports_id IS NOT NULL")
    teams = cursor.fetchall()
    cursor.close()
    return teams

def scrape_team_players(usports_id, gender, year="2024-25"):
    """Scrape player data for a specific team"""
    sport_code = "mbkb" if gender == "men" else "wbkb"
    url = f"https://en.usports.ca/sports/{sport_code}/{year}/teams/{usports_id}?view=lineup"
    
    print(f"Scraping {url}")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Failed to retrieve data: {response.status_code}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    players = []
    
    # Look for all player rows in the table
    player_rows = soup.select("table.dataTable tbody tr")
    
    for row in player_rows:
        try:
            # Extract player number
            number = row.select_one("td:nth-child(1)").text.strip()
            
            # Extract player name and ID
            name_cell = row.select_one("td:nth-child(2) a")
            if not name_cell:
                continue
                
            href = name_cell.get('href', '')
            player_id = href.split('/')[-1] if href else None
            
            if not player_id:
                continue
                
            full_name = name_cell.text.strip()
            name_parts = full_name.split()
            first_name = ' '.join(name_parts[:-1]) if len(name_parts) > 1 else full_name
            last_name = name_parts[-1] if len(name_parts) > 1 else ''
            
            # Extract year (academic year)
            year_cell = row.select_one("td:nth-child(3)")
            academic_year = year_cell.text.strip() if year_cell else None
            
            # Extract position
            position_cell = row.select_one("td:nth-child(4)")
            position = position_cell.text.strip() if position_cell else None
            
            players.append({
                'number': number,
                'first_name': first_name,
                'last_name': last_name,
                'usports_id': player_id,
                'academic_year': academic_year,
                'position': position
            })
            
        except Exception as e:
            print(f"Error processing player: {e}")
    
    return players

def insert_players_to_db(conn, team_id, players):
    """Insert player data into the database"""
    cursor = conn.cursor()
    inserted_count = 0
    updated_count = 0
    
    for player in players:
        try:
            # Check if player already exists
            cursor.execute(
                "SELECT id FROM players WHERE usports_id = %s",
                (player['usports_id'],)
            )
            existing_player = cursor.fetchone()
            
            if existing_player:
                # Update existing player
                cursor.execute(
                    """
                    UPDATE players 
                    SET team_id = %s, first_name = %s, last_name = %s, 
                        jersey_number = %s, position = %s, academic_year = %s,
                        updated_at = %s
                    WHERE usports_id = %s
                    """,
                    (
                        team_id, 
                        player['first_name'], 
                        player['last_name'],
                        player['number'], 
                        player['position'],
                        player['academic_year'],
                        datetime.now(),
                        player['usports_id']
                    )
                )
                updated_count += 1
            else:
                # Insert new player
                cursor.execute(
                    """
                    INSERT INTO players 
                    (team_id, first_name, last_name, jersey_number, position, academic_year, usports_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        team_id, 
                        player['first_name'], 
                        player['last_name'],
                        player['number'], 
                        player['position'],
                        player['academic_year'],
                        player['usports_id'],
                        datetime.now(),
                        datetime.now()
                    )
                )
                inserted_count += 1
                
        except Exception as e:
            print(f"Error inserting/updating player {player['first_name']} {player['last_name']}: {e}")
    
    conn.commit()
    return inserted_count, updated_count

def main():
    # Connect to the database
    try:
        conn = psycopg2.connect(
            dbname='usports_basketball',
            user='hermanjustino',
            password='',
            host='localhost'
        )
    except Exception as e:
        print(f"Database connection error: {e}")
        sys.exit(1)
    
    # Get teams with usports_id
    teams = get_team_usports_ids(conn)
    print(f"Found {len(teams)} teams with U Sports IDs")
    
    total_players = 0
    total_inserted = 0
    total_updated = 0
    
    for team in teams:
        team_id, university, gender, usports_id = team
        print(f"\nProcessing {university} ({gender})...")
        
        # Scrape team players
        players = scrape_team_players(usports_id, gender)
        print(f"Found {len(players)} players")
        
        # Insert/update players in database
        if players:
            inserted, updated = insert_players_to_db(conn, team_id, players)
            print(f"Inserted {inserted} new players, updated {updated} existing players")
            
            total_players += len(players)
            total_inserted += inserted
            total_updated += updated
        
        # Add delay to avoid hitting rate limits
        time.sleep(1)
    
    print(f"\nScraping complete! Processed {total_players} players total.")
    print(f"Inserted {total_inserted} new players, updated {total_updated} existing players.")
    
    conn.close()

if __name__ == "__main__":
    main()