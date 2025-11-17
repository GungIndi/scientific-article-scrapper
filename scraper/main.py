# main.py
import sinta_scraper
import garuda_scraper
import database

def main_cli():
    """The main CLI function to orchestrate the scraping tasks."""
    # First, check the database connection
    if database.get_db() is None:
        print("Please check your MongoDB connection details in config.py and ensure the server is running.")
        return

    print("\nWelcome to the Journal Scraper CLI!")
    print("Please choose an option:")
    print("1. Scrape Sinta Journals (and save to DB)")
    print("2. Search Garuda Articles from DB (for a keyword)")
    print("3. Export a Collection to JSON")

    choice = input("Enter your choice (1, 2, or 3): ")

    if choice == '1':
        print("\n--- Sinta Journal Scraper ---")
        
        collections = database.list_collections()
        print("Existing collections:", collections if collections else "None")

        sinta_collection_name = ""
        overwrite = False

        action = input("Do you want to (1) Overwrite an existing collection or (2) Add a new one? [1/2]: ")
        
        if action == '1':
            overwrite = True
            if not collections:
                print("No collections exist to overwrite. Please add a new one.")
                sinta_collection_name = input("Enter the name for the new collection: ").strip()
                if not sinta_collection_name:
                    print("Collection name cannot be empty.")
                    return
            else:
                sinta_collection_name = input("Enter the name of the collection to overwrite: ").strip()
                if sinta_collection_name not in collections:
                    print(f"Collection '{sinta_collection_name}' does not exist. It will be created.")
        
        elif action == '2':
            overwrite = False
            sinta_collection_name = input("Enter the name for the new collection: ").strip()
            if not sinta_collection_name:
                print("Collection name cannot be empty.")
                return
        else:
            print("Invalid choice.")
            return

        ranks_input = input("Enter Sinta ranks to scrape (e.g., '1,2,3'): ")
        try:
            sinta_ranks = [int(r.strip()) for r in ranks_input.split(',') if r.strip().isdigit() and 1 <= int(r.strip()) <= 6]
            if not sinta_ranks:
                print("Invalid input for Sinta ranks.")
                return
            
            print("\\nAvailable Journal Categories:")
            print("  1: Religion")
            print("  2: Economy")
            print("  3: Humanities")
            print("  4: Health")
            print("  5: Science")
            print("  6: Education")
            print("  7: Agriculture")
            print("  8: Art")
            print("  9: Social")
            print(" 10: Engineering")
            categories_input = input("Enter category numbers to filter (e.g., '10,5,2' for Engineering, Science, Economy): ")
            filter_area_codes = [int(c.strip()) for c in categories_input.split(',') if c.strip().isdigit() and 1 <= int(c.strip()) <= 10]
            if not filter_area_codes:
                print("No valid categories selected. Scraping without category filter.")
            
            max_pages_input = input("Enter max pages to scrape (e.g., 10): ")
            max_pages = int(max_pages_input)

            print(f"Selected Sinta ranks: {sinta_ranks}. Selected Categories: {filter_area_codes}. Target collection: '{sinta_collection_name}', Overwrite: {overwrite}")
            sinta_scraper.scrape_all_sinta_journals(
                sinta_ranks=sinta_ranks, 
                filter_area_codes=filter_area_codes,
                max_pages=max_pages,
                collection_name=sinta_collection_name,
                overwrite=overwrite
            )

        except ValueError:
            print("Invalid input format for ranks or pages.")

    elif choice == '2':
        print("\n--- Garuda Article Scraper ---")
        
        collections = database.list_collections()
        if not collections:
            print("No collections found in the database to search from. Please scrape Sinta journals first.")
            return
            
        print("Available Sinta journal collections:", [c for c in collections if 'garuda_results' not in c])
        source_collection = input("Enter the name of the Sinta collection to search from: ").strip()

        if not source_collection or source_collection not in collections:
            print("Invalid collection name.")
            return

        keyword = input("Enter the keyword to search for in articles: ")
        if not keyword.strip():
            print("Keyword cannot be empty.")
            return
            
        garuda_scraper.search_garuda_for_query(query=keyword, source_collection=source_collection)

    elif choice == '3':
        print("\\n--- Export Collection to JSON ---")
        collections = database.list_collections()
        if not collections:
            print("No collections found in the database to export.")
            return
        
        print("Available collections:", collections)
        collection_to_export = input("Enter the name of the collection to export: ").strip()

        if not collection_to_export or collection_to_export not in collections:
            print("Invalid collection name.")
            return
        
        database.export_collection_to_json(collection_to_export)

    else:
        print("Invalid choice. Please run the script again and choose 1, 2, or 3.")


if __name__ == "__main__":
    main_cli()
