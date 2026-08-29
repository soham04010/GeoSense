Sateye: Satellite Environmental Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-4285F4?style=flat&logo=google-earth)](https://earthengine.google.com/)

Sateye is an advanced climate intelligence platform designed to provide high-resolution environmental monitoring for modern urban environments. By integrating multi-spectral satellite imagery with real-time ground-level analytics, the platform offers precise insights into urban heat patterns, vegetation health, and multifaceted air pollution indices.

![Sateye Mockup](file:///C:/Users/ASUS/.gemini/antigravity/brain/64ecc815-da52-4f79-9097-13bf1833a2e9/sateye_mockup_1774157512583.png)

## Overview

Traditional urban environmental monitoring often suffers from a lack of spatial density. Ground stations provide precise data but are geographically sparse. Satellite imagery offers global coverage but requires complex processing to be actionable at a city scale. 

Sateye bridges this gap through a unified data fusion architecture, enabling urban planners and environmental researchers to move from generalized city averages to granular, ward-level diagnostics.

## Core Capabilities

### Multi-Spectral Spatial Analysis
Sateye leverages the Google Earth Engine (GEE) API to process and visualize petabytes of satellite data:
*   *Land Surface Temperature (LST)*: High-resolution thermal mapping identifying Urban Heat Islands (UHI).
*   *Normalized Difference Vegetation Index (NDVI)*: Temporal and spatial vegetation health monitoring.
*   *Atmospheric Composition*: Real-time monitoring of $NO_2$, $SO_2$, and other gaseous pollutants using Sentinel-5P data.

### Automated Diagnostic Engine
The platform includes an automated reporting system that generates comprehensive environmental action plans:
*   *Sector-Level Diagnostics*: Automated analysis of urban wards using a high-resolution mesh.
*   *Intervention Strategy Generation*: Ranked mitigation strategies based on localized environmental risk factors.
*   *Executive PDF Reporting*: Production-ready documentation for policy stakeholders.

### Real-Time Infrastructure
Sateye integrates directly with the World Air Quality Index (WAQI) for ground-truth validation:
*   *Sensor Fusion*: Synchronized satellite telemetry and ground station feeds.
*   *Global Geocoding*: Seamless city discovery and data fetching across all global regions.

## Technical Architecture

The system utilizes a decoupled micro-architecture designed for scalability and performance.

mermaid
graph TD
    DataSources[Data Sources: GEE / Sentinel / Landsat / WAQI] --> API[FastAPI Backend]
    API --> Processing[ML Engine: Scikit-learn]
    API --> Reporting[Document Engine: ReportLab]
    Processing --> Cache[PostGIS / Spatial Caching]
    API --> Frontend[Next.js 15 App Router]
    Frontend --> MapLib[Interactive Leaflet Layers]
    Frontend --> Analytics[Recharts Data Visualization]


### Stack Specification
*   *Frontend*: Next.js 15, React 19, Tailwind CSS 4, Framer Motion.
*   *Backend*: FastAPI (Python), Google Earth Engine Python API, Geopandas, Shapely.
*   *Analysis*: Scikit-learn for time-series trend forecasting.
*   *Storage*: Supabase / PostgreSQL with PostGIS for spatial data management.

## Installation and Deployment

### Environment Configuration
The platform requires several environment variables for full functionality. Create a .env file in the root directory:

bash
# Backend
GEE_SERVICE_ACCOUNT=your_service_account@project.iam.gserviceaccount.com
WAQI_TOKEN=your_waqi_api_token
DATABASE_URL=your_postgresql_url

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8001


### Local Development Setup

1.  *Initialize Backend*
    bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python main.py
    

2.  *Initialize Frontend*
    bash
    cd frontend
    npm install
    npm run dev
    

## Roadmap

*   *Predictive Modeling*: Deep learning integration for 30-day pollution forecasting.
*   *Historical Regression*: 15-year temporal trend analysis for all major global cities.
*   *Mobile Geospatial Dashboard*: Optimized React Native interface for field researchers.
*   *API Gateway*: Public REST API for third-party institutional integration.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full text.

---
Developed by the Sateye Intelligence Team.
