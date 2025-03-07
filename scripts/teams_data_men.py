import requests
from bs4 import BeautifulSoup
import psycopg2

def process_table(table, conference, division, cursor):
    rows = table.find_all('tr')
    for row in rows[1:]:  # Skip header row
        cells = row.find_all('td')
        if len(cells) >= 7:
            university = cells[0].text.strip() if len(cells) > 0 else None
            varsity_name = cells[1].text.strip() if len(cells) > 1 else None
            city = cells[2].text.strip() if len(cells) > 2 else None
            province = cells[3].text.strip() if len(cells) > 3 else None
            founded = cells[4].text.strip() if len(cells) > 4 else None
            arena = cells[5].text.strip() if len(cells) > 5 else None
            capacity_text = cells[6].text.strip().replace(',', '') if len(cells) > 6 else None
            capacity = int(capacity_text) if capacity_text and capacity_text.isdigit() else None

            print(f'Adding: {university} - {varsity_name} ({conference}/{division})')
            
            cursor.execute('''
                INSERT INTO teams (university, varsity_name, city, province, founded, arena, capacity, gender, conference, division)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (varsity_name, gender) DO NOTHING
            ''', (university, varsity_name, city, province, founded, arena, capacity, 'men', conference, division))

def main():
    url = 'https://en.wikipedia.org/wiki/U_Sports_men%27s_basketball'
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f'Failed to retrieve page: {response.status_code}')
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Connect to database
    conn = psycopg2.connect(
        dbname='usports_basketball',
        user='hermanjustino',
        password='',
        host='localhost'
    )
    cursor = conn.cursor()

    # Clear existing data
    # cursor.execute('TRUNCATE TABLE teams RESTART IDENTITY CASCADE')

    # Process each conference
    for conference_id in ['Atlantic_University_Sport', 'Canada_West_Universities_Athletic_Association', 
                         'Ontario_University_Athletics', 'Réseau_du_sport_étudiant_du_Québec']:
        
        conference_h3 = soup.find('h3', id=conference_id)
        if not conference_h3:
            continue

        conference_name = conference_h3.text.strip()
        print(f'\nProcessing conference: {conference_name}')

        if conference_id == 'Ontario_University_Athletics':
            # Handle OUA divisions
            for division in ['East_Division', 'West_Division', 'Central_Division']:
                div_h4 = soup.find('h4', id=division)
                if div_h4:
                    div_name = division.replace('_Division', '')
                    print(f'Processing division: {div_name}')
                    
                    # Find next table after division header
                    next_table = div_h4.find_next('table', class_='wikitable')
                    if next_table:
                        process_table(next_table, conference_name, div_name, cursor)
        else:
            # For non-OUA conferences, find first table after conference header
            next_table = conference_h3.find_next('table', class_='wikitable')
            if next_table:
                process_table(next_table, conference_name, None, cursor)

    conn.commit()
    conn.close()
    print('\nFinished processing all conferences')

if __name__ == '__main__':
    main()