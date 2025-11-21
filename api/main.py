# api/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import scraper modules from the 'scraper' package
from scraper import sinta_scraper
from scraper import garuda_scraper
from scraper import database

app = FastAPI(
    title="Journal Scraper API",
    description="API for scraping academic journal data from Sinta and Garuda, and managing collections in MongoDB.",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    logger.info("API startup: Initializing MongoDB connection...")
    db = database.get_db()
    if db is None:
        logger.error("Failed to connect to MongoDB on startup.")
        # Depending on desired behavior, you might want to raise an exception here
        # or just log and allow the app to start with limited functionality.
    else:
        logger.info("MongoDB connection established successfully.")

@app.get("/", summary="Root endpoint", response_description="Returns a welcome message")
async def read_root():
    return {"message": "Welcome to the Journal Scraper API! Visit /docs for API documentation."}

# --- Pydantic Models for Request Bodies ---

class SintaScrapeRequest(BaseModel):
    sinta_ranks: list[int]
    filter_area_codes: list[int] = []
    max_pages: int = 10
    collection_name: str
    overwrite: bool = False

class GarudaSearchRequest(BaseModel):
    query: str
    source_collection: str

class ExportRequest(BaseModel):
    collection_name: str

# --- API Endpoints ---

@app.post("/scrape/sinta", summary="Scrape Sinta Journals")
async def scrape_sinta_journals_api(request: SintaScrapeRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received Sinta scrape request: {request.dict()}")
    
    # Run the synchronous scraping function in a background thread
    # This prevents the API from blocking while scraping
    background_tasks.add_task(
        sinta_scraper.scrape_all_sinta_journals,
        sinta_ranks=request.sinta_ranks,
        filter_area_codes=request.filter_area_codes,
        max_pages=request.max_pages,
        collection_name=request.collection_name,
        overwrite=request.overwrite
    )
    
    return {"message": "Sinta scraping initiated in the background.", "details": request.dict()}

@app.post("/scrape/garuda", summary="Search Garuda Articles")
async def search_garuda_articles_api(request: GarudaSearchRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received Garuda search request: {request.dict()}")

    background_tasks.add_task(
        garuda_scraper.search_garuda_for_query,
        query=request.query,
        source_collection=request.source_collection
    )
    
    return {"message": "Garuda article search initiated in the background.", "details": request.dict()}

@app.get("/collections", summary="List all available MongoDB collections")
async def list_db_collections():
    collections = database.list_collections()
    return {"collections": collections}

from fastapi.responses import StreamingResponse
import io
import json

# ... (other imports)

# ... (FastAPI app setup and other endpoints)

@app.post("/export", summary="Export a MongoDB collection to JSON")
async def export_collection_api(request: ExportRequest):
    logger.info(f"Received export request for collection: {request.collection_name}")

    documents = database.export_collection_to_json(collection_name=request.collection_name)

    if documents is None:
        raise HTTPException(status_code=404, detail=f"Collection '{request.collection_name}' not found or is empty.")

    # Convert the list of dictionaries to a JSON string
    json_data = json.dumps(documents, indent=2, ensure_ascii=False)
    
    # Create an in-memory text stream
    stream = io.StringIO(json_data)
    
    # Define the filename for the download
    filename = f"{request.collection_name.replace(' ', '_')}.json"
    
    return StreamingResponse(
        iter([stream.read()]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

class DeleteRequest(BaseModel):
    collection_name: str
    password: str

@app.delete("/collections/{collection_name}", summary="Delete a MongoDB collection")
async def delete_collection_api(collection_name: str, request: DeleteRequest):
    logger.info(f"Received delete request for collection: {collection_name}")
    
    # Import config for password verification
    from scraper import config
    
    # Verify password
    if request.password != config.DELETE_PASSWORD:
        logger.warning(f"Failed delete attempt for {collection_name}: incorrect password")
        raise HTTPException(status_code=403, detail="Incorrect password. Deletion denied.")
    
    # Check if collection exists
    collections = database.list_collections()
    if collection_name not in collections:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' not found.")
    
    try:
        db = database.get_db()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection failed.")
        
        # Drop the collection
        db[collection_name].drop()
        logger.info(f"Successfully deleted collection: {collection_name}")
        
        return {"message": f"Collection '{collection_name}' has been deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting collection {collection_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {str(e)}")
