# Production Deployment & Architecture Guide (Raspberry Pi)

This document provides a comprehensive overview of how the Wayfinder application is deployed, networked, and configured on the production Raspberry Pi (`2ndFloor`), along with critical instructions for future development teams.

---

## 🏗️ 1. Architecture Overview

In the production environment, the application consists of four main components interacting as follows:

1. **Ngrok (Public Gateway):** Exposes the Pi's internal Nginx server to the public internet via a secure HTTPS URL.
2. **Nginx (Web Server & Reverse Proxy):** Listens on port `80`. It serves the compiled React frontend directly to users and forwards any API requests to the Node.js backend.
3. **Node.js/Express (Backend):** Listens on port `5000`. Managed entirely by `systemd`. Handles searching, navigation logic, and fetching Ngrok config. 
4. **PostgreSQL (Database):** Hosted locally on the Pi on port `5432`. Stores all room layouts, nodes, and librarian mappings.

### Why this setup?
Nginx cleanly separates static frontend files from the API. The frontend doesn't need to boot up a Node.js server. Ngrok points strictly to Nginx (Port 80) so that mobile devices scanning the QR Code can hit a secure HTTPS endpoint instead of the Pi's local network IP.

---

## 📂 2. Crucial File Locations on the Pi

If you SSH into the Pi (`ssh wayfinder@2ndFloor`), the files you need to care about are spread across the system:

* **Source Code repo:** `/home/wayfinder/WayfinderMain/`
* **Nginx Configuration:** `/etc/nginx/sites-available/default`
* **Frontend Compiled Files:** `/var/www/` *(Nginx serves everything inside this folder)*
* **Backend System Service:** `/etc/systemd/system/wayfinder-backend.service`
* **Ngrok System Service:** `/etc/systemd/system/ngrok.service`
* **Backend Dedicated Logs:** `/var/log/wayfinder/backend.log`
* **Nginx Logs:** `/var/log/nginx/error.log` and `/var/log/nginx/access.log`

---

## 🌐 3. Networking & Ngrok Routing

The networking stack routes traffic using endpoints and headers to ensure things don't break across different devices.

1. **The Routing Mechanism:** 
   * When a user requests `https://[ngrok-url]/`, Nginx serves `index.html` from `/var/www/`. 
   * When a user requests `https://[ngrok-url]/api/...`, Nginx intercepts this via its `location /api` block and **reverse proxies** the request to `http://localhost:5000/api/...`.
   * **Wait, why `/api`?** We specifically added the `/api` prefix to all backend routes to let Nginx accurately differentiate between someone requesting a React web page and someone querying the Postgres database.

2. **The "Mobile Handoff" Flow:** 
   * The kiosk (running on `localhost` or via Tailscale) generates a QR code. 
   * The QR code dynamically fetches the active Ngrok URL via a custom endpoint `/api/config`. 
   * **Important:** Free Ngrok accounts inject an intrusive browser warning page on the first visit. To prevent this from breaking JSON API fetch calls on the mobile device, **every frontend `fetch()` request must include the header:**
     `"ngrok-skip-browser-warning": "true"`

---

## 🛠️ 4. Deploying Updates to the Pi

When the `main` branch is updated on GitHub, it does **not** instantly go live on the Pi. You must pull the new code, rebuild it, copy the frontend to Nginx, and restart the backend.

**Run the following command chain on the Pi to perform a full deployment update:**

```bash
# 1. Pull latest code
cd /home/wayfinder/WayfinderMain
git fetch origin main && git reset --hard origin/main && git pull origin main

# 2. Rebuild the backend
cd backend
npm install
npm run build

# 3. Rebuild the frontend
cd ../frontend
npm install
npm run build

# 4. Deploy frontend to Nginx
sudo rm -rf /var/www/*
sudo cp -r dist/* /var/www/

# 5. Restart backend service
sudo systemctl restart wayfinder-backend
```

---

## 🧑‍💻 5. Guide for Future Development Teams

When picking up this project, adhere to the following standards to ensure production stability:

### Modifying the Frontend
* Do not hardcode API requests to `http://localhost:5000`. 
* Use relative routes like `fetch("/api/search")`. 
* When making a new API request, ensure the `ngrok-skip-browser-warning` header is present. If it's missing, mobile API requests will fail due to Ngrok returning standard HTML instead of JSON.

### Modifying the Backend Services
* Ensure all new routes begin with `/api/` (e.g., `app.use("/api/new-feature", ...)`).
* Do not rely on `console.log()` for persistent data analysis. In production, these are appended to `/var/log/wayfinder/backend.log`. Use this log to debug deployment errors!
* Keep the local `.env` file cleanly updated. Do NOT commit the production database password to GitHub.

### Modifying the Database
The Postgres database sits strictly on the Pi. 
* **User:** `postgres`
* **Password:** Same as the Pi's user password (`FindYourWay`)
* If you modify the tables, update `backend/src/db/init.sql`. To fully wipe and re-initialize the database on the Pi, you can execute:
  `sudo -u postgres psql -f /home/wayfinder/WayfinderMain/backend/src/db/init.sql`

### Debugging Services
If the app stops responding on the Pi, always check the `systemd` statuses first to see what crashed:
* `systemctl status nginx`
* `systemctl status wayfinder-backend`
* `systemctl status ngrok`
