# Pulse V2 Backend

Agentic AI Hospital Operations Cockpit powered by Groq API.

## Architecture

```
DataAgent → ForecastAgent → DecisionAgent (Groq LLM) → CommunicationAgent
```

### Components

1. **DataAgent**: Loads CSV data and builds operational context
2. **ForecastAgent**: Generates admission forecasts using Prophet (with deterministic fallback)
3. **DecisionAgent**: Makes operational decisions using Groq LLM
4. **CommunicationAgent**: Formats outputs for API, alerts, SMS, email, dashboard
5. **Pipeline**: Orchestrates the complete workflow

### Tools

- **forecast_tool**: Time series forecasting with Prophet/fallback
- **risk_tool**: Threshold-based risk scoring (AQI, occupancy, surge)
- **scenario_tool**: What-if analysis and scenario simulation

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./pulse.db
SECRET_KEY=your-secret-key-change-in-production
```

Get your Groq API key from: https://console.groq.com

### 3. Run the Server

```bash
uvicorn app.main:app --reload
```

Server will start at: http://localhost:8000

API Documentation: http://localhost:8000/docs

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Forecast

- `POST /forecast/run` - Run complete pipeline
- `GET /forecast/latest` - Get latest forecast
- `GET /forecast/history` - Get forecast history

### Alerts

- `GET /alerts/active` - Get unresolved alerts
- `GET /alerts/all` - Get all alerts
- `POST /alerts/resolve/{id}` - Resolve alert

### AQI

- `POST /aqi/` - Create AQI record
- `GET /aqi/{city}` - Get AQI history
- `GET /aqi/{city}/latest` - Get latest AQI

### Status

- `GET /status/` - Get system status
- `GET /status/health` - Health check

## Example API Calls

### Run Forecast Pipeline

```bash
curl -X POST http://localhost:8000/forecast/run \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "horizon": 7
  }'
```

### Run Scenario

```bash
curl -X POST http://localhost:8000/forecast/run \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "horizon": 7,
    "scenario": {
      "aqi_override": 250,
      "festival": true
    }
  }'
```

### Get Active Alerts

```bash
curl http://localhost:8000/alerts/active
```

## Groq Models

Available models (configure in `.env`):

- `llama3-70b-8192` (default) - Fast, high quality
- `mixtral-8x7b-32768` - Large context window
- `qwen2-72b-32768` - Alternative high-performance model

## Scheduler

Automatic jobs:

- **Forecast Job**: Runs every 6 hours (configurable)
- **Decision Job**: Runs every 1 hour (configurable)

Configure intervals in `.env`:

```env
FORECAST_INTERVAL_HOURS=6
DECISION_INTERVAL_HOURS=1
```

## Database

SQLite by default. For production, use PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost/pulse_v2
```

## Development

### Run Tests

```bash
pytest tests/ -v
```

### View Logs

Logs are output to console with INFO level by default.

### Sample Decision Output

See `sample_outputs/decision_example.json` for expected DecisionAgent output format.

## Deployment

### Docker

```bash
docker build -t pulse-v2-backend .
docker run -p 8000:8000 --env-file .env pulse-v2-backend
```

### Production Checklist

- [ ] Change `SECRET_KEY` to strong random value
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Backup database regularly

## Architecture Diagram

```
┌─────────────┐
│   CSV Data  │
└──────┬──────┘
       │
       v
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│ DataAgent   │────▶│ForecastAgent │────▶│DecisionAgent │────▶│CommunicationAgent│
│ (Context)   │     │  (Prophet)   │     │  (Groq LLM)  │     │   (Formatting)   │
└─────────────┘     └──────────────┘     └──────────────┘     └────────┬─────────┘
                                                                        │
                                                                        v
                                                              ┌──────────────────┐
                                                              │   Database       │
                                                              │ (Forecasts,      │
                                                              │  Alerts, Status) │
                                                              └──────────────────┘
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
