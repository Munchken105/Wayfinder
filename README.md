# 🧭 Lockwood Library Wayfinder (Main)

**Vol 2.0 • Integrated Spatial Navigation System**

A comprehensive indoor navigation solution for Lockwood Library that combines a robust PostgreSQL/Express backend with a polished "Scientific Journal" styled React frontend. This version integrates the advanced UI and interactive features of the prototype while maintaining real-time data connectivity.

---

## 📋 Overview

Users interact with a "Research Paper" interface to find destinations within the library. The application features a modular React architecture, SVG-based interactive maps, and seamless mobile handoff via QR codes.

### Key Features

#### 1. 🏛️ "Scientific Journal" Visual Identity
- **Aesthetic**: Mimics an academic paper on a desk, using UB Brand colors (`#005bbb` Blue, `#ffc72c` Gold).
- **Typography**: Uses `Lora` (Serif) for headings and `Open Sans` (Sans-Serif) for UI elements.
- **Layout**: Split-pane design with "Search Parameters" (Controls) on the left and "Figure 1" (Map) on the right.

#### 2. 🗺️ Interactive Vector Map
- **Technology**: Built with `@panzoom/panzoom` and SVG overlays.
- **Functionality**: Users can zoom/pan the floor plan.
- **Pathfinding**: Visualizes routes using an animated "Gold Dashed Line" overlay that connects real-world nodes dynamically.
- **Coordinate System**: Bridges real backend data with the frontend map using a custom coordinate mapping system (`nodeCoordinates.ts`).

#### 3. 🔍 Smart Search & Categorization
- **Backend-Powered**: Search queries hit the `/api/rooms` endpoint to fetch real room data (e.g., "Room 221", "Study Area").
- **Categories**: Quick access buttons for "Sanitary Facilities", "Individual Study Areas", and "Computation Labs".

#### 4. 📱 Mobile Handoff (QR Code)
- **Dynamic Generation**: Generates a QR code for any selected route.
- **Network Aware**: The app automatically detects the host machine's IP address so that mobile devices on the same Wi-Fi can scan the code and open the navigation on their own screens.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

### 1. Database Setup
Ensure PostgreSQL is running and set up the database:

```bash
# In the /backend directory
npm run db:init
```

Create a `.env` file in `/backend` with your credentials:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wayfinder
PORT=5000
```

### 2. One-Step Launch (Cross-Platform)

We provide a universal launcher that works on **Windows**, **macOS**, and **Linux**. It automatically installs dependencies, detects your local LAN IP (for mobile testing), and starts both servers.

From the project root:
```bash
node launch.js
```

**What this does:**
1.  **Auto-Detection**: Identifies your correct LAN IP (e.g., `10.x.x.x` or `192.168.x.x`).
2.  **Configuration**: Writes this IP to `frontend/.env.local` so the QR codes work on your network.
3.  **Startup**: Spawns both the **Backend** (Port 5000) and **Frontend** (Port 5173).

> **Note**: Requires Node.js installed on your machine.

### 3. Manual Startup
If you prefer running components separately:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- --host
```

---

## 🏗️ Technical Architecture

### Frontend (`/frontend`)
Refactored into a modern React + TypeScript application.

| Component | Description |
|-----------|-------------|
| `WayfinderApp.tsx` | Main container. Handles state, IP detection, and layout. |
| `ControlsPanel.tsx` | "Sidebar". Handles search inputs, autocomplete, and QR codes. |
| `MapPanel.tsx` | "Figure 1". Handles the map image, Panzoom logic, and SVG path rendering. |
| `nodeCoordinates.ts` | **Critical Data**. Maps backend `node_id` strings to `{x, y}` pixels on the floor map image. |

### Backend (`/backend`)
Express.js server with PostgreSQL.
- **API**: Serves room data (`/api/rooms`) and calculates shortest paths (`/api/navigation...`) using BFS.
- **Data Source**: Fetches nodes and edges from the Postgres database.

---

## 🔧 Troubleshooting

### Mobile Handoff / QR Code Issues
- **Problem**: Scanning the QR code fails to load the site on a phone.
- **Solution**: Ensure your computer and phone are on the **Same Wi-Fi Network**. Use `./launch.sh` to ensure the app is running on your LAN IP, not just `localhost`.

### Map Path "Snapping"
- **Problem**: The path looks jagged or jumps across the map.
- **Explanation**: The path visualization relies on `nodeCoordinates.ts`. If a node returned by the backend (like a hallway junction) isn't defined in that file, the line might skip a segment.
- **Fix**: Add the missing `node_id` and its approximate coordinates to `frontend/src/data/nodeCoordinates.ts`.

---

**University at Buffalo • CSE453 Project**
