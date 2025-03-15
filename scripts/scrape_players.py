import requests
from bs4 import BeautifulSoup
import psycopg2
import time
import sys
import random
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def get_teams_with_website_keys(conn):
    """Get all teams with their website_key from the database"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, university, gender, website_key FROM teams WHERE website_key IS NOT NULL")
    teams = cursor.fetchall()
    cursor.close()
    return teams

def scrape_team_players(website_key, gender, year="2024-25"):
    """Scrape player data for a specific team using Selenium"""
    sport_code = "mbkb" if gender == "men" else "wbkb"
    url = f"https://en.usports.ca/sports/{sport_code}/{year}/teams/{website_key}?view=lineup"
    
    print(f"Scraping {url} using Selenium")
    
    # Set up Chrome options for headless browsing
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Set up Chrome driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get(url)
        
        # Wait for the table to load (adjust timeout as needed)
        wait = WebDriverWait(driver, 20)
        table = wait.until(
            EC.presence_of_element_located((By.ID, "DataTables_Table_0"))
        )
        
        # Get the page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Save HTML for debugging
        with open(f"debug_selenium_{website_key}.html", 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        
        players = []
        
        # Find the player rows in the table
        player_rows = soup.select("table#DataTables_Table_0 tbody tr")
        
        if not player_rows:
            print(f"No player rows found for {website_key}")
            return []
        
        print(f"Found {len(player_rows)} player rows")
        
        for row in player_rows:
            try:
                # Extract data from cells
                cells = row.find_all('td')
                
                if len(cells) < 4:
                    continue
                
                # Extract player number
                number = cells[0].text.strip() if cells[0] else ""
                
                # Extract player name and ID
                name_cell = cells[1] if len(cells) > 1 else None
                if not name_cell:
                    continue
                
                name_link = name_cell.find('a')
                if not name_link:
                    continue
                
                href = name_link.get('href', '')
                player_page_id = href.split('/')[-1] if href else None
                
                if not player_page_id:
                    # Generate a consistent player ID from name and team
                    player_page_id = f"{name_link.text.strip().lower().replace(' ', '_')}_{website_key}"
                
                full_name = name_link.text.strip()
                name_parts = full_name.split()
                first_name = ' '.join(name_parts[:-1]) if len(name_parts) > 1 else full_name
                last_name = name_parts[-1] if len(name_parts) > 1 else ''
                
                # Extract academic year
                academic_year = cells[2].text.strip() if len(cells) > 2 else ""
                
                # Extract position
                position = cells[3].text.strip() if len(cells) > 3 else ""
                
                players.append({
                    'number': number,
                    'first_name': first_name,
                    'last_name': last_name,
                    'player_page_id': player_page_id,
                    'academic_year': academic_year,
                    'position': position
                })
                
            except Exception as e:
                print(f"Error processing player row: {e}")
        
        return players
    
    except Exception as e:
        print(f"Selenium error: {e}")
        return []
    
    finally:
        driver.quit()

def insert_players_to_db(conn, team_id, players):
    """Insert player data into the database"""
    cursor = conn.cursor()
    inserted_count = 0
    updated_count = 0
    
    for player in players:
        try:
            # Check if player already exists using player_page_id
            cursor.execute(
                "SELECT id FROM players WHERE usports_player_id = %s",
                (player['player_page_id'],)
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
                    WHERE usports_player_id = %s
                    """,
                    (
                        team_id, 
                        player['first_name'], 
                        player['last_name'],
                        player['number'], 
                        player['position'],
                        player['academic_year'],
                        datetime.now(),
                        player['player_page_id']
                    )
                )
                updated_count += 1
            else:
                # Insert new player
                cursor.execute(
                    """
                    INSERT INTO players 
                    (team_id, first_name, last_name, jersey_number, position, academic_year,
                     usports_player_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        team_id, 
                        player['first_name'], 
                        player['last_name'],
                        player['number'], 
                        player['position'],
                        player['academic_year'],
                        player['player_page_id'],
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
    
    # Get teams with website_key
    teams = get_teams_with_website_keys(conn)
    print(f"Found {len(teams)} teams with website keys")
    
    total_players = 0
    total_inserted = 0
    total_updated = 0
    
    for team in teams:
        team_id, university, gender, website_key = team
        print(f"\nProcessing {university} ({gender})...")
        
        # Scrape team players
        players = scrape_team_players(website_key, gender)
        print(f"Found {len(players)} players")
        
        # Insert/update players in database
        if players:
            inserted, updated = insert_players_to_db(conn, team_id, players)
            print(f"Inserted {inserted} new players, updated {updated} existing players")
            
            total_players += len(players)
            total_inserted += inserted
            total_updated += updated
        
        # Add delay to avoid hitting rate limits
        delay = random.uniform(4, 8)
        print(f"Waiting {delay:.1f} seconds before next request...")
        time.sleep(delay)
    
    print(f"\nScraping complete! Processed {total_players} players total.")
    print(f"Inserted {total_inserted} new players, updated {total_updated} existing players.")
    
    conn.close()

if __name__ == "__main__":
    main()