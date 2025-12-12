# Pulse V2 Frontend

Modern React frontends for Pulse V2 hospital operations system.

## Projects

### Landing Page (`/landing`)
Framer-style marketing landing page with:
- Hero section with gradient text and animations
- Feature cards
- Product preview
- CTA sections
- Responsive design

**Port**: 5173

### Dashboard (`/dashboard`)
Operations dashboard with:
- Real-time KPI cards (Occupancy, AQI, Risk, Surge)
- Interactive forecast charts
- AI-powered recommendations
- Reasoning trace visualization
- Forecast Lab with scenario simulation
- AskPulse chat interface

**Port**: 5174

## Quick Start

### Landing Page

```bash
cd frontend/landing
npm install
npm run dev
```

Visit: http://localhost:5173

### Dashboard

```bash
cd frontend/dashboard
npm install
npm run dev
```

Visit: http://localhost:5174

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - API calls
- **Lucide React** - Icons

## Features

### Landing Page
- ✅ Framer-style hero with gradient text
- ✅ Animated feature cards
- ✅ Floating stats
- ✅ Product preview section
- ✅ CTA sections
- ✅ Responsive design

### Dashboard
- ✅ Sidebar navigation
- ✅ KPI cards with real-time data
- ✅ Forecast visualization
- ✅ Recommended actions panel
- ✅ AI reasoning trace
- ✅ Forecast Lab with controls
- ✅ AskPulse chat interface
- ✅ API integration with fallback
- ✅ Mock data for demo

## API Integration

Dashboard connects to backend at `http://localhost:8000`

Endpoints used:
- `GET /forecast/latest` - Latest forecast data
- `POST /forecast/run` - Run new forecast
- `GET /status` - System status

Falls back to mock data if backend is unavailable.

## Development

### Add New Page

1. Create component in `dashboard/src/pages/`
2. Add route in `dashboard/src/App.jsx`
3. Add navigation item in Sidebar

### Customize Theme

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      pulse: {
        // Your custom colors
      }
    }
  }
}
```

## Build for Production

### Landing

```bash
cd frontend/landing
npm run build
```

Output: `landing/dist/`

### Dashboard

```bash
cd frontend/dashboard
npm run build
```

Output: `dashboard/dist/`

## Deployment

### Static Hosting (Vercel, Netlify)

1. Build the project
2. Deploy `dist/` folder
3. Configure environment variables for API URL

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Access in code:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

## License

MIT
