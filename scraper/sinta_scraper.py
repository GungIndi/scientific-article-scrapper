# sinta_scraper.py
import requests
import time
import re
from bs4 import BeautifulSoup

import config
import database

session = requests.Session()
session.headers.update(config.SINTA_HEADERS)

def initialize_sinta_filters(sinta_ranks, filter_area_codes):
    """Send initial POST request to apply Sinta filters based on user input."""
    payload = {
        "filter_garuda": "1",
        "filter_journals": "1",
    }
    for rank in sinta_ranks:
        payload[f"filter_accreditation[{rank}]"] = str(rank)
    
    for area_code in filter_area_codes:
        payload[f"filter_area[{area_code}]"] = str(area_code)

    print("🎯 Initializing Sinta filters (POST)...")
    try:
        resp = session.post(config.SINTA_BASE_URL, data=payload, timeout=15)
        resp.raise_for_status()
        print("✅ Filters initialized successfully.")
    except requests.RequestException as e:
        print(f"⚠️ Failed to initialize filters: {e}")
        return False
    return True


def scrape_page(page):
    """Scrape a single page using GET, after session initialized"""
    url = f"{config.SINTA_BASE_URL}?page={page}"
    print(f"\n🌐 Fetching page {page}: {url}")

    try:
        resp = session.get(url, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"⚠️ Failed to fetch page {page}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    journals = soup.find_all("div", class_="list-item")

    results = []
    for j in journals:
        name_tag = j.select_one(".affil-name a")
        name = name_tag.get_text(strip=True) if name_tag else "Unknown"

        accred_tag = j.select_one(".num-stat.accredited a")
        accred_text = accred_tag.get_text(strip=True) if accred_tag else "Unknown"
        accred_match = re.search(r"S(\d+)", accred_text)
        accred_number = int(accred_match.group(1)) if accred_match else None

        sinta_link_tag = j.select_one("div.affil-name.mb-3 a")
        sinta_link = sinta_link_tag["href"] if sinta_link_tag else "no sinta link"

        garuda_tag = j.find("a", href=re.compile(r"garuda\.kemdikbud\.go\.id"))
        garuda_link = garuda_tag["href"] if garuda_tag else "no garuda link"

        print(f"✅ {name} | Sinta {accred_number} | {sinta_link} | {garuda_link}")

        results.append(
            {
                "name": name,
                "sinta": accred_number,
                "sinta_link": sinta_link,
                "garuda_link": garuda_link,
            }
        )

    return results


def scrape_all_sinta_journals(max_pages=10, delay=2, sinta_ranks=[1, 2, 3], filter_area_codes=[], collection_name=config.SINTA_JOURNALS_COLLECTION, overwrite=False):
    """
    Scrapes Sinta journals with the given filters and saves them to the specified database collection.
    """
    if not initialize_sinta_filters(sinta_ranks, filter_area_codes):
        return

    total_saved = 0
    for page in range(1, max_pages + 1):
        data = scrape_page(page)
        if not data:
            print(f"🚫 No data found on page {page}, stopping early.")
            break
        
        # The first time through, respect the overwrite flag.
        # Subsequent pages should always append, not overwrite.
        saved_count = database.save_sinta_journals(data, collection_name, overwrite)
        if overwrite:
            overwrite = False
            
        total_saved += saved_count
        
        time.sleep(delay)  # Be nice to the server

    print(f"\n✨ Scraping complete. A total of {total_saved} journals were saved/updated in the '{collection_name}' collection.")
