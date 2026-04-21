# BlueCurrent Control

Modern AI-powered admin dashboard for a desalination system that monitors saline water treatment performance and predicts `clean_water` output in `m³`.

## What’s included

- React + Vite frontend with a responsive blue-and-white admin layout
- Overview page with benchmark metrics and operating summary cards
- Dataset viewer with search, filtering, and pagination
- Prediction module for `hour`, `day`, `month`, `temp`, `energy_price`, `water_demand`, `salinity`, and `input_water`
- Visualization page with:
  - Actual vs predicted line chart
  - Actual vs predicted scatter plot
  - Feature importance bar chart
  - Error distribution chart
- Model performance page with MAE, MSE, R², residual plot, and accuracy bands
- Insights page covering:
  - Salinity vs clean water
  - Temperature vs efficiency
  - Energy price vs production
- Flask backend with `/api` endpoints and a dataset-driven KNN-style prediction model

## Project structure

- `src/App.jsx` – routed dashboard UI
- `src/lib/desalinationAnalytics.js` – frontend analytics and local prediction fallback
- `src/data/desalinationDataset.json` – desalination dataset used by the UI and backend
- `backend/app.py` – Flask API for health, overview, dataset, analytics, and prediction

## Run the frontend

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173`.

## Run the backend

```bash
python3 backend/app.py
```

The Flask API runs on `http://127.0.0.1:5000`.

Vite is already configured to proxy `/api/*` requests to the Flask server during development.

## Available API routes

- `GET /api/health`
- `GET /api/overview`
- `GET /api/dataset?page=1&page_size=10&search=&month=all&day=all`
- `GET /api/analytics`
- `POST /api/predict`

Example prediction payload:

```json
{
  "hour": 14,
  "day": 2,
  "month": 1,
  "temp": -3.1,
  "energy_price": 1200,
  "water_demand": 216.6,
  "salinity": 15.6,
  "input_water": 324.7
}
```

## Verification

- `npm run build`
- `npm run lint`
- `python3 -m py_compile backend/app.py`
