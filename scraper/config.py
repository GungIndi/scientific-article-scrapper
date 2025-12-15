# config.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
try:
    # Get the project root directory (parent of scraper/)
    project_root = Path(__file__).parent.parent
    dotenv_path = project_root / '.env'
    load_dotenv(dotenv_path)
except ImportError:
    # python-dotenv not installed, will use system environment variables only
    pass

# Sinta Scraper Configuration
SINTA_BASE_URL = os.getenv("SINTA_BASE_URL", "https://sinta.kemdiktisaintek.go.id/journals/index")
SINTA_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://sinta.kemdiktisaintek.go.id",
    "Referer": "https://sinta.kemdiktisaintek.go.id/journals/index",
    "Connection": "keep-alive",
}

# Garuda Scraper Configuration
GARUDA_SEARCH_URL = os.getenv("GARUDA_SEARCH_URL", "https://garuda.kemdikbud.go.id/journal/view")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "journal_scraper")
SINTA_JOURNALS_COLLECTION = os.getenv("SINTA_JOURNALS_COLLECTION", "sinta_journals")
GARUDA_ARTICLES_COLLECTION = os.getenv("GARUDA_ARTICLES_COLLECTION", "garuda_articles")

# Security Configuration
DELETE_PASSWORD = os.getenv("DELETE_PASSWORD", "admin123")  # Default: admin123 (CHANGE IN PRODUCTION!)
