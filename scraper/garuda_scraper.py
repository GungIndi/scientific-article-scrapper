# garuda_scraper.py
import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import quote

from . import config
from . import database

session = requests.Session()
session.headers.update(config.SINTA_HEADERS) # Reuse Sinta headers for consistency

def search_garuda_for_query(query, source_collection, delay=1):
    """
    Iterates over Garuda links from a specified database collection and searches for a given query.
    """
    try:
        journals = database.get_sinta_journals_for_garuda_search(source_collection)
        if not journals:
            print(f"❌ No journals with Garuda links found in the collection '{source_collection}'. Run the Sinta scraper first.")
            return

        # Create a descriptive name for the results collection
        # Format: articles_[source]_[query]
        # MongoDB collection names have a 120 character limit
        query_slug = query.lower().replace(' ', '_').replace('/', '_')[:30]  # Limit query slug to 30 chars
        source_slug = source_collection[:40]  # Limit source collection to 40 chars
        results_collection_name = f"articles_{source_slug}_{query_slug}"
        
        # Ensure total length doesn't exceed 120 characters
        if len(results_collection_name) > 120:
            results_collection_name = results_collection_name[:120]
        
        print(f"\n🔍 Found {len(journals)} journals in '{source_collection}' to search.")
        print(f"📁 Results will be saved to collection: '{results_collection_name}'")
        print(f"🔎 Starting search for query: '{query}'\n")
        
        total_journals_with_results = 0
        total_articles_saved = 0

        for i, j in enumerate(journals, 1):
            try:
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
                    try:
                        if database.save_garuda_articles(result_entry, results_collection_name):
                            total_journals_with_results += 1
                            total_articles_saved += len(total_articles)
                            print(f"   💾 Saved {len(total_articles)} articles to database")
                        print(f"📦 Total found in {j['name']}: {len(total_articles)} articles\n")
                    except Exception as save_error:
                        print(f"   ❌ Failed to save articles: {save_error}\n")
                else:
                    print(f"   ⚠️ No articles found for '{query}' in {j['name']}.\n")
                    
            except Exception as journal_error:
                print(f"   ❌ Error processing journal {j.get('name', 'Unknown')}: {journal_error}\n")
                continue

        print(f"\n✨ Search complete!")
        print(f"📊 {total_journals_with_results} journals had results for the query '{query}'")
        print(f"📝 Total articles saved: {total_articles_saved}")
        print(f"📁 Data saved to collection: '{results_collection_name}'")
        
    except Exception as e:
        print(f"\n❌ Fatal error in search_garuda_for_query: {e}")
        import traceback
        traceback.print_exc()
