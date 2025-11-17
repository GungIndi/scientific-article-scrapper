# garuda_scraper.py
import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import quote

import config
import database

session = requests.Session()
session.headers.update(config.SINTA_HEADERS) # Reuse Sinta headers for consistency

def search_garuda_for_query(query, source_collection, delay=1):
    """
    Iterates over Garuda links from a specified database collection and searches for a given query.
    """
    journals = database.get_sinta_journals_for_garuda_search(source_collection)
    if not journals:
        print(f"❌ No journals with Garuda links found in the collection '{source_collection}'. Run the Sinta scraper first.")
        return

    # Create a descriptive name for the results collection
    query_slug = query.lower().replace(' ', '_').replace('/', '_')
    results_collection_name = f"garuda_results_from_{source_collection}_for_{query_slug}"
    
    print(f"\n🔍 Found {len(journals)} journals in '{source_collection}' to search. Results will be saved to '{results_collection_name}'.")
    print(f"Starting search for query: '{query}'\n")
    
    total_journals_with_results = 0

    for i, j in enumerate(journals, 1):
        garuda_link = j.get("garuda_link")
        # This check is technically redundant given the DB query, but good for safety
        if not garuda_link or "garuda.kemdikbud.go.id" not in garuda_link:
            continue

        page = 1
        total_articles = []
        
        print(f"[{i}/{len(journals)}] 🔗 Searching in journal: {j.get('name', 'Unknown')}")

        while True:
            search_url = (
                f"{garuda_link}?page={page}&q={quote(query)}"
                if page > 1
                else f"{garuda_link}?q={quote(query)}"
            )
            print(f"   🌐 Page {page}: {search_url}")

            try:
                resp = session.get(search_url, timeout=15)
                if resp.status_code != 200:
                    print(f"   ⚠️  Failed ({resp.status_code})")
                    break 

                soup = BeautifulSoup(resp.text, "html.parser")
                articles = soup.select("div.article-item")

                if not articles:
                    print("   🚫 No more articles found, moving to next journal.")
                    break

                page_articles = []
                for art in articles:
                    title_tag = art.select_one(".title-article xmp")
                    title = title_tag.get_text(strip=True) if title_tag else "No Title"

                    download_tag = art.select_one(
                        "a.title-citation[href*='article/download']"
                    )
                    download_link = download_tag["href"] if download_tag else None

                    page_articles.append(
                        {"title": title, "download_link": download_link}
                    )
                
                total_articles.extend(page_articles)
                print(f"   ✅ Found {len(page_articles)} articles on this page.")
                page += 1
                time.sleep(delay)

            except requests.RequestException as e:
                print(f"   ❌ Error for {garuda_link}: {e}")
                break 
        
        if total_articles:
            result_entry = {
                "journal_name": j["name"],
                "sinta_level": j.get("sinta"),
                "garuda_link": garuda_link,
                "query": query,
                "results_count": len(total_articles),
                "results": total_articles,
            }
            if database.save_garuda_articles(result_entry, results_collection_name):
                total_journals_with_results += 1
            print(f"📦 Total found in {j['name']}: {len(total_articles)} articles\n")
        else:
            print(f"   ⚠️ No articles found for '{query}' in {j['name']}.\n")

    print(f"\n✨ Search complete. {total_journals_with_results} journals had results for the query '{query}'. Data saved to '{results_collection_name}'.")
