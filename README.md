# CyberbabaSAB

A modern, full-featured web interface for SABnzbd, built with React + TypeScript + Express.

![SABnzbd](https://img.shields.io/badge/SABnzbd-5.0+-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

<img width="1248" height="675" alt="Image" src="https://github.com/user-attachments/assets/bec24dd2-c51f-4e80-90fa-5a5e58b3d6ad" />

<img width="1244" height="787" alt="Image" src="https://github.com/user-attachments/assets/438111fd-2dbe-4bf0-b4db-efd0a8b76ce4" />

<img width="1258" height="534" alt="Image" src="https://github.com/user-attachments/assets/aca80384-ef62-4e64-9c27-f47d4f3aaed7" />

<img width="1251" height="624" alt="Image" src="https://github.com/user-attachments/assets/706f9e1c-b415-4ff9-a17e-8e3cc92803b0" />

<img width="1240" height="869" alt="Image" src="https://github.com/user-attachments/assets/315f2afa-a01d-4b63-a57f-362869e634af" />

<img width="1227" height="876" alt="Image" src="https://github.com/user-attachments/assets/7ee22bad-f7a1-4524-87dc-20d6f4fe4951" />

## Features

- Secure login with first-launch setup (username + password, bcrypt hashed, JWT cookie)
- Real-time dashboard: 5 selectable speed gauge styles (arc, donut, bar, speedometer with needle, digital), 10-minute speed history chart, draggable/reorderable tiles (layout persisted), fullscreen monitoring mode, full-width queue overview with live speed/size/ETA per job
- Paginated download history directly on the dashboard (10/25/50 entries per page), no separate history page needed
- Connection status indicator showing whether the backend can reach SABnzbd
- Real-time updates via Socket.IO with automatic polling fallback
- Drop NZB files anywhere on the dashboard page, or browse and upload a .nzb file directly from your device
- Full queue management: pause, resume, timed pause (15/30/60/120/240 min), rename, reorder, search, sort (name/size/progress/priority/category), delete, bulk priority, view files
- Complete history with search, retry, retry-all-failed, expandable post-processing logs, and switchable list/grid views
- Color-coded categories across the queue and history for quick visual scanning
- Statistics page: daily/weekly/monthly/total download totals, 24h hourly chart, per-server connection stats
- Full RSS management: add/edit/delete feeds, ordered filters (accept/reject/must-contain/category-required/series), read feed now, enable/disable
- Usenet server management (add, edit, delete, test connection)
- Category management (add, edit, delete)
- Schedule / planning
- All SABnzbd settings configurable from the UI
- NZB upload by drag & drop, file browser, or URL
- Multi-language: French, English, Spanish, Italian, German
- Dark / Light theme
- 5 accent colors (cyan, violet, green, orange, rose)
- Customizable app name, logo (used as favicon and title) and accent color
- Mobile-friendly with slide-in sidebar
- Browser notifications on job complete / failure
- Change password from the preferences page
- Toast notifications for all actions, with confirmation dialogs before destructive operations
- Automatic redirect to login on session expiry
- Installable as a PWA (Progressive Web App) on desktop and mobile

## Quick Start

### Option 1 - Docker CLI

Create a `docker-compose.yml` and a `.env` file in the same folder:

**docker-compose.yml**
```yaml
services:
  cyberbabasab-backend:
    container_name: cyberbabasab-backend
    image: cyberbabacool/cyberbabasab-backend:latest
    restart: unless-stopped
    environment:
      - PORT=3000
      - SAB_URL=${SAB_URL}
      - SAB_API_KEY=${SAB_API_KEY}
      - CONFIG_PATH=/config/auth.json
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "${BACKEND_PORT:-3001}:3000"
    volumes:
      - cyberbabasab-config:/config
    networks:
      - cyberbabasab

  cyberbabasab-frontend:
    container_name: cyberbabasab-frontend
    image: cyberbabacool/cyberbabasab-frontend:latest
    restart: unless-stopped
    depends_on:
      - cyberbabasab-backend
    ports:
      - "${FRONTEND_PORT:-8088}:80"
    networks:
      - cyberbabasab

volumes:
  cyberbabasab-config:

networks:
  cyberbabasab:
    driver: bridge
```

**.env**
```env
SAB_URL=http://YOUR_SABNZBD_IP:8080
SAB_API_KEY=YOUR_API_KEY_HERE
JWT_SECRET=CHANGE_ME_TO_A_RANDOM_SECRET
# Optional - default ports shown below
BACKEND_PORT=3001
FRONTEND_PORT=8088
```

Generate a secure JWT_SECRET:
```bash
openssl rand -hex 32
```

Then:
```bash
docker compose up -d
```

### Option 2 - Portainer (Web editor)

1. Portainer > Stacks > Add stack > **Web editor**
2. Paste the `docker-compose.yml` above
3. Scroll down to **Environment variables** and add:

| Name | Value |
|------|-------|
| SAB_URL | http://YOUR_SABNZBD_IP:8080 |
| SAB_API_KEY | your SABnzbd API key |
| JWT_SECRET | a random string (openssl rand -hex 32) |

4. Click **Deploy the stack**

> The `${VAR}` syntax in the compose file is replaced by Portainer using the values you enter in the Environment variables section. No `.env` file needed.

Access at `http://YOUR_SERVER_IP:8088`

On first access, a setup page will ask you to create your username and password.

## Build from Source

### Prerequisites

- Docker
- Node.js 20+ (only if building without Docker)

### 1. Clone

```bash
git clone https://github.com/cyberbabacool/cyberbabasab.git
cd cyberbabasab
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your values
openssl rand -hex 32  # use this as JWT_SECRET
```

### 3. Build Docker images

```bash
docker build -t cyberbabacool/cyberbabasab-backend:latest ./backend
docker build -t cyberbabacool/cyberbabasab-frontend:latest ./frontend
```

### 4. Deploy

```bash
docker compose up -d
```

## Authentication

On first launch, CyberbabaSAB shows a setup page where you choose your username and password.
The password is hashed with bcrypt (cost 12) and stored in a Docker volume (`/config/auth.json`).
Authentication uses httpOnly JWT cookies valid for 7 days.
All API routes are protected - unauthenticated requests return HTTP 401.
A logout button is available at the bottom of the sidebar.
Password can be changed from the Preferences page.

To reset credentials, delete the config volume:

```bash
docker compose down
docker volume rm STACKNAME_cyberbabasab-config
docker compose up -d
```

> Replace `STACKNAME` with your Portainer stack name or the folder name if using Docker CLI.
> To find the exact volume name: `docker volume ls | grep cyberbabasab`

## Nginx Reverse Proxy (optional)

```nginx
server {
    listen 443 ssl http2;
    server_name sab.yourdomain.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| SAB_URL | SABnzbd base URL (no trailing /) | http://192.168.1.10:8080 |
| SAB_API_KEY | SABnzbd API key | abc123... |
| JWT_SECRET | Secret for JWT signing (keep private) | random hex string |
| CONFIG_PATH | Path to auth config inside container | /config/auth.json |
| BACKEND_PORT | Host port for the backend (optional) | 3001 |
| FRONTEND_PORT | Host port for the frontend (optional) | 8088 |

## Project Structure

```
cyberbabasab/
  backend/
    src/
      index.ts              - Express server + Socket.IO
      auth.ts               - JWT auth, bcrypt, setup/login logic
      routes/
        sab.routes.ts       - SABnzbd API routes (protected)
        auth.routes.ts      - Auth routes (setup, login, logout)
      services/
        sab.service.ts      - SABnzbd API client
    package.json
    tsconfig.json
    Dockerfile
  frontend/
    src/
      App.tsx
      main.tsx              - Theme/title/favicon, axios 401 interceptor, SW registration
      i18n.ts               - Translations (fr/en/es/it/de)
      components/
        Toggle.tsx          - Reusable toggle switch
        ConfirmDialog.tsx   - Confirmation modal for destructive actions
        ConnectionStatus.tsx - Backend-to-SABnzbd connection indicator
        SpeedHistory.tsx    - 10-minute speed history hook and sparkline chart
        SpeedGauge.tsx      - 5 gauge styles (arc, donut, bar, speedometer, digital)
        PageDropZone.tsx    - Page-wide NZB drag-and-drop overlay
        useCategoryColors.tsx - Consistent color assignment per category
      hooks/
        useSab.ts           - SABnzbd data hooks (queue, history, config, status, stats)
        useSocket.ts        - Socket.IO client for real-time queue updates
        useDashboardLayout.ts - Draggable tile order, persisted in localStorage
        usePrefs.ts         - User preferences (theme, lang, title, favicon)
        useAuth.ts          - Auth state, API calls, session expiry handling
        useToast.tsx        - Toast notification system
      pages/
        LoginPage.tsx
        SetupPage.tsx
        DashboardPage.tsx   - Speed gauge, 10min chart, draggable tiles, fullscreen, queue+paginated history
        QueuePage.tsx       - Search, sort, timed pause, bulk priority, confirmations
        StatsPage.tsx       - Download totals and per-server stats
        ServersPage.tsx
        CategoriesPage.tsx
        SchedulePage.tsx
        RssPage.tsx         - Full feed and filter management
        SettingsPage.tsx
        PreferencesPage.tsx - Theme, lang, branding, password change
      widgets/
        StatsWidget.tsx
    public/
      logo.png              - Replace with your logo (used as favicon)
      manifest.json         - PWA manifest
      sw.js                 - Service worker
    nginx.conf
    package.json
    vite.config.ts
    Dockerfile
  docker-compose.yml
  .env.example
```

## Customization

All UI preferences are stored in browser localStorage (no server restart needed):

- Dark / Light theme
- Accent color (cyan, violet, green, orange, rose)
- Language (fr, en, es, it, de)
- App name (used as browser tab title)
- Logo URL (used as favicon and sidebar logo)
- Speed gauge style: Arc (half-circle), Donut (full circle), Bar (horizontal), Speedometer (needle with graduation marks), Digital (large number)
- History entries per page on dashboard (10, 25 or 50)
- Refresh interval (1s to 10s)
- Number of jobs shown on dashboard
- Compact mode
- Speed unit (MB/s or KB/s)
- Browser notifications on job complete / failure
- Change password

## PWA Installation

CyberbabaSAB can be installed as a standalone app:

- **Desktop (Chrome/Edge)**: click the install icon in the address bar, or browser menu > Install CyberbabaSAB
- **Android (Chrome)**: menu > Add to Home screen
- **iOS (Safari)**: Share button > Add to Home Screen

Once installed, it opens in its own window without browser UI. API and auth requests always go to the network (never cached), so data is always live.

## License

MIT
