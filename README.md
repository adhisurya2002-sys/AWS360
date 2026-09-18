# AVS 360 · Animal Disease Surveillance & Decision Support System

> **Official National & State Animal Health Surveillance, Syndromic Outbreak Triage, and Real-Time Field Telemetry Decision Support Platform**  
> *Smart India Hackathon (SIH) Solution*

---

## Overview

Livestock owners, field veterinarians, para-veterinary workers, and government departments often lack a unified, real-time mechanism to identify emerging animal-health risks at the village, block, and district levels. 

**AVS 360** addresses this challenge with an integrated epidemiological command system that combines:
1. **Macro Surveillance Command**: Real-time syndromic disease reporting, dynamic OpenStreetMap GIS outbreak mapping with 3 km & 5 km ring containment buffer perimeters, Rapid Response Team (RRT) mobilization, diagnostic laboratory referral tracking, and multilingual SMS/IVR advisory broadcasts.
2. **Micro Vital Telemetry**: Real-time 1Hz wearable biometric telemetry streaming (Heart Rate, SpO₂, Core Temperature) from IoT Bluetooth Low Energy (BLE) tags with automated edge risk triage (Normal, Warning, Abnormal, Critical).
3. **Offline-First Capabilities**: Offline clinical AI differential triage and queued background synchronization for low-connectivity rural field deployments.

---

## Core Features

- **OpenStreetMap GIS Outbreak Perimeter Mapping**:
  - Multi-tier geospatial cluster tracking (e.g., FMD, LSD, PPR, Black Quarter).
  - Dynamic 3 km infected zone and 5 km surveillance ring containment buffers.
  - Interactive veterinary infrastructure mapping (District Diagnostic Labs & Taluk Veterinary Dispensaries).
  - High-contrast government cartographic styling (Carto Voyager & OpenStreetMap base layers).

- **Real-Time IoT Field Telemetry**:
  - Continuous 1Hz vitals streaming with photoplethysmography (PPG) and temperature trends.
  - Multi-species baseline vitals evaluation (Bovine, Caprine, Canine, Feline).
  - BLE GATT protocol integration (`Nordic UART Service`).

- **Epidemiological Decision Support**:
  - Automated syndromic case logging and diagnostic classification.
  - Cold-chain laboratory sample tracking and PCR/ELISA confirmation workflows.
  - Multilingual voice/SMS advisory broadcasts in English, Kannada, Hindi, Tamil, and Telugu.
  - Offline-first differential symptom analysis.

- **Institutional Design System**:
  - Crisp pure white background and Royal Indigo institutional shield styling.
  - Zero-emoji iconography using official Lucide SVG symbols.
  - Fully responsive on mobile, tablet, and desktop viewports.

---

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/) with OpenStreetMap & CartoDB tiles
- **Charts & Telemetry**: Recharts
- **Database & Sync**: Supabase (PostgreSQL, Realtime, Local Storage Offline Fallback)
- **Hardware Protocol**: Web Bluetooth API (GATT BLE)

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/adhisurya2002-sys/AWS360.git
cd AWS360

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Development

```bash
# Run local development server (default port 8080)
npm run dev
```

Visit `http://localhost:8080` in your browser. Demo mode is preconfigured for offline and instant field evaluation without requiring external credentials.

### Production Build

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Build production bundle
npm run build
```

---

## License

Government of Karnataka & Department of Animal Husbandry & Veterinary Services · SIH Project.
