# Journal Scraper

A comprehensive web scraping and data management system for Indonesian academic journals and articles from **Sinta** (Sistema Informasi Riset Teknologi Sains Pendidikan) and **Garuda** (Garba Rujukan Digital) portals.

## 🎯 Overview

This project automates the process of collecting, storing, and managing academic journal metadata and article information from Indonesian scientific repositories. It provides both a command-line interface (CLI) and a RESTful API with a modern web frontend for easy interaction.

### Key Features

- **Multi-Source Scraping**: Extract journal data from Sinta and article data from Garuda
- **Flexible Storage**: MongoDB-based storage with collection management
- **Dual Interface**: 
  - Interactive CLI for terminal-based operations
  - Modern React web interface for visual interaction
  - RESTful API for programmatic access
- **Advanced Filtering**: Filter by Sinta rank (1-6) and subject categories
- **Data Export**: Export collections to JSON format
- **Docker Support**: Containerized deployment with Docker Compose
- **Background Processing**: Non-blocking API operations for long-running scraping tasks

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Docker Deployment](#docker-deployment)
  - [CLI Mode](#cli-mode)
  - [API Mode](#api-mode)
  - [Web Frontend](#web-frontend)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Architecture

The project consists of three main components:

1. **Backend Scrapers** (Python)
   - `sinta_scraper.py`: Scrapes journal metadata from Sinta
   - `garuda_scraper.py`: Searches and scrapes article data from Garuda
   - `database.py`: MongoDB operations and data management

2. **API Server** (FastAPI)
   - RESTful endpoints for scraping operations
   - Collection management
   - Data export functionality
   - Background task processing

3. **Frontend** (React + Vite)
   - Dashboard with statistics
   - Sinta journal scraping interface
   - Garuda article search interface
   - Collection management and export

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  FastAPI Server │
│   (Port 8000)   │
└────────┬────────┘
         │
         │ Python API
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Scraper Modules │      │   MongoDB DB    │
│  - Sinta        │◄────►│  (Port 27017)   │
│  - Garuda       │      └─────────────────┘
└─────────────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────┐
│ External Sites  │
│ - Sinta Portal  │
│ - Garuda Portal │
└─────────────────┘
```

## 🔧 Prerequisites

### For Docker Deployment (Recommended)
- Docker (20.10+)
- Docker Compose (1.29+)

### For Manual Setup
- Python 3.8+
- Node.js 16+ and npm
- MongoDB 4.4+

## 📦 Installation

### Option 1: Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd journal_scrapper
```

2. Start all services:
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- FastAPI server on port 8000
- CLI container (interactive)

3. For the frontend (run separately):
```bash
cd frontend
npm install
npm run dev
```

### Option 2: Manual Setup

1. **Backend Setup**

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

2. **Frontend Setup**

```bash
cd frontend
npm install
```

3. **MongoDB Setup**

Install and start MongoDB locally, or use a MongoDB cloud service. Default configuration expects MongoDB at `mongodb://localhost:27017/`.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/
MONGO_DATABASE=journal_scraper

# Security
DELETE_PASSWORD=your_secure_password_here
```

### Configuration File

Edit `scraper/config.py` to customize:

- MongoDB connection details
- Sinta scraping headers
- Garuda search URLs
- Security settings

```python
# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
MONGO_DATABASE = "journal_scraper"

# Security Configuration
DELETE_PASSWORD = os.getenv("DELETE_PASSWORD", "admin123")
```

## 🚀 Usage

### Docker Deployment

**Start all services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop all services:**
```bash
docker-compose down
```

**Access interactive CLI:**
```bash
docker exec -it scraper_cli python cli.py
```

### CLI Mode

Run the CLI directly:

```bash
python main.py cli
```

#### CLI Options:

1. **Scrape Sinta Journals**
   - Choose to overwrite existing collection or create new
   - Select Sinta ranks (1-6)
   - Filter by categories (1-10)
   - Set maximum pages to scrape

2. **Search Garuda Articles**
   - Select source collection (Sinta journals)
   - Enter search keywords
   - Results saved to new collection

3. **Export Collection**
   - Choose collection to export
   - Exports to JSON file in `exports/` directory

#### Example CLI Session:

```
Welcome to the Journal Scraper CLI!
Please choose an option:
1. Scrape Sinta Journals (and save to DB)
2. Search Garuda Articles from DB (for a keyword)
3. Export a Collection to JSON
Enter your choice (1, 2, or 3): 1

--- Sinta Journal Scraper ---
Existing collections: ['Sinta_Engineering', 'Sinta_Health']
Do you want to (1) Overwrite an existing collection or (2) Add a new one? [1/2]: 2
Enter the name for the new collection: Sinta_Science
Enter Sinta ranks to scrape (e.g., '1,2,3'): 1,2,3

Available Journal Categories:
  1: Religion
  2: Economy
  3: Humanities
  4: Health
  5: Science
  6: Education
  7: Agriculture
  8: Art
  9: Social
 10: Engineering
Enter category numbers to filter (e.g., '10,5,2'): 5
Enter max pages to scrape (e.g., 10): 5
```

### API Mode

Start the FastAPI server:

```bash
python main.py api
```

The API will be available at `http://localhost:8000`

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Web Frontend

Start the development server:

```bash
cd frontend
npm run dev
```

Access the web interface at `http://localhost:5173`

**Frontend Features:**
- **Dashboard**: View collection statistics and recent activity
- **Scrape Sinta**: Visual interface for Sinta journal scraping
- **Search Garuda**: Search and scrape Garuda articles
- **Collections**: Manage, export, and delete collections

## 📁 Project Structure

```
journal_scrapper/
├── api/
│   ├── __init__.py
│   └── main.py                 # FastAPI application
├── scraper/
│   ├── __init__.py
│   ├── config.py               # Configuration settings
│   ├── database.py             # MongoDB operations
│   ├── sinta_scraper.py        # Sinta scraping logic
│   └── garuda_scraper.py       # Garuda scraping logic
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # UI components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScrapeSinta.jsx
│   │   │   ├── SearchGaruda.jsx
│   │   │   └── Collections.jsx
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── results/                    # Scraping result files
├── exports/                    # Exported JSON files
├── cli.py                     # CLI interface
├── main.py                    # Entry point
├── scrape-articles.py         # Legacy scraping script
├── test_mongo.py              # MongoDB connection test
├── requirements.txt           # Python dependencies
├── package.json
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Docker image definition
├── GEMINI.md                  # AI assistant context
└── README.md                  # This file
```

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Get API Info
```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to the Journal Scraper API! Visit /docs for API documentation."
}
```

#### 2. Scrape Sinta Journals
```http
POST /scrape/sinta
```

**Request Body:**
```json
{
  "sinta_ranks": [1, 2, 3],
  "filter_area_codes": [10, 5],
  "max_pages": 10,
  "collection_name": "Sinta_Engineering_Science",
  "overwrite": false
}
```

**Response:**
```json
{
  "message": "Sinta scraping initiated in the background.",
  "details": {
    "sinta_ranks": [1, 2, 3],
    "filter_area_codes": [10, 5],
    "max_pages": 10,
    "collection_name": "Sinta_Engineering_Science",
    "overwrite": false
  }
}
```

#### 3. Search Garuda Articles
```http
POST /scrape/garuda
```

**Request Body:**
```json
{
  "query": "machine learning",
  "source_collection": "Sinta_Engineering"
}
```

**Response:**
```json
{
  "message": "Garuda article search initiated in the background.",
  "details": {
    "query": "machine learning",
    "source_collection": "Sinta_Engineering"
  }
}
```

#### 4. List Collections
```http
GET /collections
```

**Response:**
```json
{
  "collections": [
    "Sinta_Engineering",
    "Sinta_Health",
    "garuda_results_machine_learning"
  ]
}
```

#### 5. Export Collection
```http
POST /export
```

**Request Body:**
```json
{
  "collection_name": "Sinta_Engineering"
}
```

**Response:**
- Downloads JSON file with collection data

#### 6. Delete Collection
```http
DELETE /collections/{collection_name}
```

**Request Body:**
```json
{
  "collection_name": "Sinta_Engineering",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Collection 'Sinta_Engineering' has been deleted successfully."
}
```

### Category Codes

| Code | Category    |
|------|-------------|
| 1    | Religion    |
| 2    | Economy     |
| 3    | Humanities  |
| 4    | Health      |
| 5    | Science     |
| 6    | Education   |
| 7    | Agriculture |
| 8    | Art         |
| 9    | Social      |
| 10   | Engineering |

## 💾 Data Models

### Sinta Journal Document

```json
{
  "_id": "ObjectId(...)",
  "rank": 1,
  "journal_name": "International Journal of...",
  "issn": "1234-5678",
  "eissn": "9876-5432",
  "publisher": "University of ...",
  "accreditation": "S1",
  "area": "Engineering",
  "garuda_url": "https://garuda.kemdikbud.go.id/journal/view/...",
  "scraped_at": "2024-12-14T15:30:00"
}
```

### Garuda Article Document

```json
{
  "_id": "ObjectId(...)",
  "title": "Machine Learning Application in...",
  "authors": ["Author 1", "Author 2"],
  "abstract": "This research explores...",
  "keywords": ["machine learning", "deep learning"],
  "journal_name": "International Journal of...",
  "publication_year": 2023,
  "doi": "10.1234/example.2023.001",
  "url": "https://garuda.kemdikbud.go.id/article/...",
  "source_query": "machine learning",
  "scraped_at": "2024-12-14T15:35:00"
}
```

## 🛠️ Development

### Running Tests

```bash
# Test MongoDB connection
python test_mongo.py
```

### Code Style

The project follows PEP 8 for Python code and ESLint configuration for JavaScript/React.

### Adding New Features

1. **Backend**: Add new scraping logic in `scraper/` directory
2. **API**: Add new endpoints in `api/main.py`
3. **Frontend**: Add new pages in `frontend/src/pages/`

### Building Frontend for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

