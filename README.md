# WAYFINDER — BLE Beacon Tourism App
### Île Maurice & Madagascar

A proximity-based tourism guide powered by BLE beacons. When a visitor walks near a beacon placed at a tourist site, the app automatically triggers rich contextual content: audio guides, maps, nearby services, and real-time promotions — even with poor or no GPS signal.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TERRAIN                              │
│  [Beacon BLE]  ──── diffuse UUID/Major/Minor ──────────────│
│  (iBeacon / Eddystone)                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Bluetooth LE (1–30 m)
┌─────────────────────▼───────────────────────────────────────┐
│                   MOBILE APP (React Native)                 │
│  BLEService → detect beacon → fetch content → display UI   │
│  ✓ Offline cache   ✓ Anti-spam   ✓ Audio guide             │
│  ✓ Map view        ✓ Nearby services                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (Wi-Fi / 4G)
┌─────────────────────▼───────────────────────────────────────┐
│                 BACKEND API (Node.js / Express)             │
│  GET /api/beacon/:id  →  POI content                       │
│  GET /api/pois        →  All points of interest            │
│  POST /api/detect     →  Analytics                         │
│  SQLite database  (deployable on a €5/month VPS)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
WAYFINDER/
├── backend/          # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── index.ts
│   │   ├── database/   (SQLite schema + seed data)
│   │   ├── routes/     (beacons, pois, content)
│   │   ├── models/
│   │   └── services/
│   └── Dockerfile
├── mobile/           # React Native (Android + iOS)
│   ├── src/
│   │   ├── services/   (BLE, API, Cache)
│   │   ├── screens/    (Home, POI Detail, Map, Settings)
│   │   ├── components/ (BeaconCard, AudioGuide, NearbyServices…)
│   │   ├── store/      (Redux Toolkit)
│   │   └── navigation/
│   └── index.js
└── docker-compose.yml
```

---

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # development (ts-node-dev)
npm run build && npm start   # production
```

### Mobile

```bash
cd mobile
npm install
# iOS
cd ios && pod install && cd ..
npx react-native run-ios
# Android
npx react-native run-android
```

### Docker (backend only)

```bash
docker-compose up -d
```

---

## POI Coverage

### Île Maurice
| Site | Coordonnées |
|------|-------------|
| Chamarel – Terre des 7 couleurs | -20.4275, 57.3650 |
| Chutes de Chamarel | -20.4244, 57.3581 |
| Parc National Rivière Noire | -20.3833, 57.3833 |
| Blue Penny Museum, Port Louis | -20.1622, 57.4989 |
| Marché Central de Port Louis | -20.1633, 57.4994 |
| Grand Baie | -20.0133, 57.5853 |
| Le Morne (UNESCO) | -20.4508, 57.3181 |
| Jardin de Pamplemousses | -20.0996, 57.5862 |
| Caudan Waterfront | -20.1608, 57.4981 |
| Flic en Flac | -20.2933, 57.3631 |

### Madagascar
| Site | Coordonnées |
|------|-------------|
| Avenue des Baobabs, Morondava | -20.2531, 44.4147 |
| Parc National de l'Isalo | -22.5167, 45.3833 |
| Nosy Be | -13.3325, 48.2764 |
| Tsingy de Bemaraha (UNESCO) | -18.2667, 44.7167 |
| Parc National de Ranomafana | -21.2667, 47.4333 |
| Rova d'Antananarivo | -18.9167, 47.5333 |

---

## Beacon Format

The app supports **iBeacon** format:

```
Company ID: 0x004C (Apple)
Type:        0x02 0x15
UUID:        Unique per region/operator
Major:       Site ID  (1–65535)
Minor:       Spot ID  (1–65535)
TX Power:    calibrated RSSI at 1 m
```

Beacon ID stored as: `UUID-MAJOR-MINOR`  
Example: `FDA50693-A4E2-4FB1-AFCF-C6EB07647825-0001-0001`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/beacon/:beaconId` | Content for beacon |
| GET | `/api/pois` | All POIs |
| GET | `/api/pois/:id` | POI detail |
| POST | `/api/detect` | Record beacon detection |
| GET | `/api/stats` | Detection analytics |

---

## Cost Estimate (100 POI sites)

| Item | Cost |
|------|------|
| BLE beacons (Minew / Kontakt) | ~500 – 1500 € |
| VPS backend (1 core, 1 GB RAM) | ~5 €/month |
| App development | Ce repo |
| Beacon battery life | 2 – 5 years |

---

## License

MIT — Free to use, fork, and adapt for tourism projects.
