# CyberbabaSAB

A modern, full-featured web interface for SABnzbd, built with React + TypeScript + Express.

![SABnzbd](https://img.shields.io/badge/SABnzbd-5.0+-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- Secure login with first-launch setup (username + password, bcrypt hashed, JWT cookie)
- Real-time dashboard with analog speed gauge and live queue
- Full queue management (pause, resume, rename, reorder, delete, priority, view files)
- Complete history with search and retry
- Usenet server management (add, edit, delete, test connection)
- Category management (add, edit, delete)
- Schedule / planning
- RSS feeds
- All SABnzbd settings configurable from the UI
- NZB upload by drag & drop, URL, or local path
- Multi-language: French, English, Spanish, Italian, German
- Dark / Light theme
- 5 accent colors (cyan, violet, green, orange, rose)
- Customizable app name, logo (used as favicon and title) and accent color
- Mobile-friendly with slide-in sidebar
- Browser notifications on job complete / failure

## Quick Start with Docker Hub

Create a `docker-compose.yml`:

```yaml
services:
  cyberbabasab-backend:
    container_name: cyberbabasab-backend
    image: cyberbabacool/cyberbabasab-backend:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - "3001:3000"
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
      - "8088:80"
    networks:
      - cyberbabasab

volumes:
  cyberbabasab-config:

networks:
  cyberbabasab:
    driver: bridge
```

Create a `.env` file:

```env
SAB_URL=http://YOUR_SABNZBD_IP:8080
SAB_API_KEY=YOUR_API_KEY_HERE
PORT=3000
JWT_SECRET=change-me-to-a-random-secret-string
CONFIG_PATH=/config/auth.json
```

Then:

```bash
docker compose up -d
```

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
# Edit .env with your SABnzbd URL, API key, and a random JWT_SECRET
```

Generate a secure JWT_SECRET:

```bash
openssl rand -hex 32
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

Or deploy via Portainer: Stacks > Add stack > Web editor.

## Authentication

On first launch, CyberbabaSAB shows a setup page where you choose your username and password.
The password is hashed with bcrypt (cost 12) and stored in a Docker volume (`/config/auth.json`).
Authentication uses httpOnly JWT cookies valid for 7 days.
All API routes are protected - unauthenticated requests return HTTP 401.
A logout button is available at the bottom of the sidebar.

To reset credentials, delete the config volume:

```bash
docker compose down
docker volume rm cyberbabasab_cyberbabasab-config
docker compose up -d
```

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

| Variable      | Description                               | Example                    |
|---------------|-------------------------------------------|----------------------------|
| SAB_URL       | SABnzbd base URL (no trailing /)          | http://192.168.1.10:8080   |
| SAB_API_KEY   | SABnzbd API key                           | abc123...                  |
| PORT          | Backend internal port                     | 3000                       |
| JWT_SECRET    | Secret for JWT signing (keep private)     | random hex string          |
| CONFIG_PATH   | Path to auth config inside container      | /config/auth.json          |

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
      main.tsx              - Applies stored theme/title/favicon before render
      i18n.ts               - Translations (fr/en/es/it/de)
      components/
        Toggle.tsx          - Reusable toggle switch
      hooks/
        useSab.ts           - SABnzbd data hooks
        usePrefs.ts         - User preferences (theme, lang, title, favicon)
        useAuth.ts          - Auth state and API calls
      pages/
        LoginPage.tsx
        SetupPage.tsx
        DashboardPage.tsx
        QueuePage.tsx
        HistoryPage.tsx
        ServersPage.tsx
        CategoriesPage.tsx
        SchedulePage.tsx
        RssPage.tsx
        SettingsPage.tsx
        PreferencesPage.tsx
      widgets/
        SpeedWidget.tsx
        StatsWidget.tsx
    public/
      logo.png              - Replace with your logo (used as favicon)
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
- Refresh interval (1s to 10s)
- Number of jobs shown on dashboard
- Compact mode
- Speed unit (MB/s or KB/s)
- Browser notifications on job complete / failure

## License

MIT
