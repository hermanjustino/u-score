import requests
from bs4 import BeautifulSoup
import psycopg2

# URL of the Wikipedia page for U Sports men's basketball
url = 'https://en.wikipedia.org/wiki/U_Sports_women%27s_basketball'  # Replace with the correct URL for women's basketball

# Send a GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # List of possible IDs to look for
    possible_ids = ['Atlantic_University_Sport', 'Canada_West_Universities_Athletic_Association', 'Ontario_University_Athletics', 'Réseau_du_sport_étudiant_du_Québec']
    possible_ids_division = ['East_Division', 'West_Division', 'Central_Division']

    # Find all <h3> elements with the possible IDs
    conference_headings = []
    for possible_id in possible_ids:
        found_headings = soup.find_all('h3', id=possible_id)
        if found_headings:
            print(f'Found headings for ID {possible_id}: {found_headings}')
        else:
            print(f'No headings found for ID {possible_id}')
        conference_headings.extend(found_headings)

    # Debugging: Print all found conference headings
    print(f'Conference Headings: {conference_headings}')

    # Connect to PostgreSQL database
    conn = psycopg2.connect(
        dbname='usports_basketball',
        user='hermanjustino',  # replace with your PostgreSQL username
        password='',  # replace with your PostgreSQL password if needed
        host='localhost'
    )
    cursor = conn.cursor()

    # Truncate the teams table to delete all existing data (optional, if you want to clear the table first)
    cursor.execute('TRUNCATE TABLE teams RESTART IDENTITY CASCADE')

    # Iterate over the <h3> elements and find corresponding tables
    for heading in conference_headings:
        conference = heading.text.strip()
        print(f'Processing conference: {conference}')  # Debugging: Print the conference being processed
        parent_div = heading.find_parent('div', class_='mw-heading mw-heading3')

        if parent_div:
            next_sibling = parent_div.find_next_sibling()

            # Debugging: Print the next siblings until a table is found
            while next_sibling:
                print(f'Next sibling: {next_sibling.name}, class: {next_sibling.get("class")}')
                if next_sibling.name == 'table' and 'wikitable' in next_sibling.get('class', []):
                    table = next_sibling
                    print('Found table')  # Debugging: Print when a table is found

                    rows = table.find_all('tr')
                    for row in rows[1:]:  # Skip the header row
                        cells = row.find_all('td')
                        if len(cells) >= 7:  # Ensure the row has at least 7 columns
                            university = cells[0].text.strip() if len(cells) > 0 else None
                            varsity_name = cells[1].text.strip() if len(cells) > 1 else None
                            city = cells[2].text.strip() if len(cells) > 2 else None
                            province = cells[3].text.strip() if len(cells) > 3 else None
                            founded = cells[4].text.strip() if len(cells) > 4 else None
                            arena = cells[5].text.strip() if len(cells) > 5 else None
                            
                            # Handle capacity value
                            capacity_text = cells[6].text.strip().replace(',', '') if len(cells) > 6 else None
                            capacity = int(capacity_text) if capacity_text and capacity_text.isdigit() else None

                            # Debugging: Print the extracted data
                            print(f'University: {university}, Varsity Name: {varsity_name}, City: {city}, Province: {province}, Founded: {founded}, Arena: {arena}, Capacity: {capacity}, Conference: {conference}')

                            # Insert team data into the teams table
                            cursor.execute('''
                                INSERT INTO teams (university, varsity_name, city, province, founded, arena, capacity, gender, conference)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (varsity_name, gender) DO NOTHING
                            ''', (university, varsity_name, city, province, founded, arena, capacity, 'women', conference))
                    break  # Exit the loop once the table is found
                next_sibling = next_sibling.find_next_sibling()
            
            if not next_sibling:
                print('No next sibling found')  # Debugging: Print if no next sibling is found

    # Commit the transaction and close the connection
    conn.commit()
    conn.close()

    print('Teams data has been written to the PostgreSQL database')
else:
    print(f'Failed to retrieve the page. Status code: {response.status_code}')