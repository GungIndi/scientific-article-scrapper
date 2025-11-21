# main.py
import argparse
import subprocess
import sys
import os

def run_cli():
    """Runs the command-line interface."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import cli
    cli.main_cli()

def run_api():
    """Runs the FastAPI web server."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    print("Starting FastAPI server...")
    subprocess.run([sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Journal Scraper Project Entry Point")
    parser.add_argument("mode", choices=["cli", "api"], help="Choose to run the CLI or the API server.")
    
    args = parser.parse_args()

    if args.mode == "cli":
        run_cli()
    elif args.mode == "api":
        run_api()
