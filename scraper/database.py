# database.py
import json
from pymongo import MongoClient
from . import config

_db = None

def get_db():
    """Returns a singleton database instance."""
    global _db
    if _db is None:
        try:
            client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            _db = client[config.MONGO_DATABASE]
            print("✅ MongoDB connection successful.")
        except Exception as e:
            print(f"❌ Could not connect to MongoDB: {e}")
            _db = None
    return _db

def list_collections():
    """Returns a list of all non-system collections in the database."""
    db = get_db()
    if db is None:
        return []
    return [name for name in db.list_collection_names() if not name.startswith('system.')]


def save_sinta_journals(journals, collection_name, overwrite=False):
    """Saves a list of Sinta journals to a specified collection, with an option to overwrite."""
    db = get_db()
    if db is None:
        print("💔 Cannot save journals, no database connection.")
        return 0

    collection = db[collection_name]

    if overwrite:
        # To be safe, we only delete content, not drop the collection.
        print(f"🗑️ Overwriting: Deleting all documents from collection '{collection_name}'...")
        collection.delete_many({})

    update_count = 0
    for journal in journals:
        # Use sinta_link as a unique identifier to update or insert.
        result = collection.update_one(
            {"sinta_link": journal["sinta_link"]},
            {"$set": journal},
            upsert=True
        )
        if result.modified_count > 0 or result.upserted_id:
            update_count += 1
    
    print(f"💾 Saved/Updated {update_count} journals in the '{collection_name}' collection.")
    return update_count

def save_garuda_articles(articles_data, collection_name):
    """Saves the results of a Garuda article search to a specified collection."""
    db = get_db()
    if db is None:
        print("💔 Cannot save articles, no database connection.")
        return 0

    if not articles_data:
        return 0

    collection = db[collection_name]
    # We use the journal's garuda_link and the query to identify a search result document
    result = collection.update_one(
        {
            "garuda_link": articles_data["garuda_link"],
            "query": articles_data["query"],
        },
        {"$set": articles_data},
        upsert=True
    )
    
    if result.upserted_id or result.modified_count > 0:
        print(f"💾 Saved {articles_data['results_count']} articles for query '{articles_data['query']}' in journal '{articles_data['journal_name']}'.")
        return 1
    return 0

def get_sinta_journals_for_garuda_search(collection_name):
    """Fetches journals from a specific DB collection that have a valid Garuda link."""
    db = get_db()
    if db is None:
        print("💔 Cannot fetch journals, no database connection.")
        return []

    collection = db[collection_name]
    # Find journals where garuda_link exists and is not the 'no garuda link' placeholder
    return list(collection.find({
        "garuda_link": {"$exists": True, "$ne": "no garuda link"}
    }))

import os

def export_collection_to_json_file(collection_name):
    """Exports all documents from a collection to a JSON file in the 'exports' directory."""
    documents = export_collection_to_json(collection_name)
    if documents is None:
        # The export_collection_to_json function already prints the error message
        return

    if not documents:
        print(f"No documents found in collection '{collection_name}'.")
        return

    # Ensure the root 'exports' directory exists
    output_dir = "exports"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_path = os.path.join(output_dir, f"{collection_name.replace(' ', '_')}.json")
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(documents, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully exported {len(documents)} documents to '{output_path}'.")
    except IOError as e:
        print(f"❌ Failed to write to file: {e}")


def export_collection_to_json(collection_name):
    """Fetches all documents from a collection and returns them as a list."""
    db = get_db()
    if db is None:
        print("💔 Cannot export, no database connection.")
        return None

    if collection_name not in list_collections():
        print(f"❌ Collection '{collection_name}' not found.")
        return None

    collection = db[collection_name]
    documents = list(collection.find({}))
    
    # Convert ObjectId to string for JSON serialization
    for doc in documents:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
            
    return documents

