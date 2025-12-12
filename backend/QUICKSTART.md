# Pulse V2 Backend - Quick Start

## Setup Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Configure Environment

Create `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./pulse.db
SECRET_KEY=your-secret-key-change-in-production
```

Get free Groq API key: https://console.groq.com

## Run Server

```bash
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

## Test API

```bash
# Run forecast
curl -X POST http://localhost:8000/forecast/run -H "Content-Type: application/json" -d "{\"city\": \"Mumbai\", \"horizon\": 7}"

# Get status
curl http://localhost:8000/status/
```

The system works with or without Groq API key (uses intelligent fallback).
