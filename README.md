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

- Real-time dashboard with analog speed gauge
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
- Customizable app name and logo
- Mobile-friendly with slide-in sidebar
- Browser notifications on job complete / failure

## Quick Start with Docker Hub

Create a `docker-compose.yml`:

```yaml
services:
  cyberbabasab-backend:
    container_name: cyberbabasab-backend
    image: YOURUSER/cyberbabasab-backend:latest
    restart: unless-stopped
    environment:
      - SAB_URL=http://YOUR_SABNZBD_IP:8080
      - SAB_API_KEY=YOUR_API_KEY
      - PORT=3000
    ports:
      - "3001:3000"
    networks:
      - cyberbabasab

  cyberbabasab-frontend:
    container_name: cyberbabasab-frontend
    image: YOURUSER/cyberbabasab-frontend:latest
    restart: unless-stopped
    depends_on:
      - cyberbabasab-backend
    ports:
      - "8088:80"
    networks:
      - cyberbabasab

networks:
  cyberbabasab:
    driver: bridge
```

Then:

```bash
docker compose up -d
```

Access at `http://YOUR_SERVER_IP:8088`

## Build from Source

### Prerequisites

- Docker
- Node.js 20+ (only if building without Docker)

### 1. Clone

```bash
git clone https://github.com/YOURUSER/cyberbabasab.git
cd cyberbabasab
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your SABnzbd URL and API key
```

### 3. Build Docker images

```bash
docker build -t cyberbabasab-backend:latest ./backend
docker build -t cyberbabasab-frontend:latest ./frontend
```

### 4. Deploy

Use the `docker-compose.yml` at the root, or deploy via Portainer (Stacks > Add stack > Web editor).

## Nginx Reverse Proxy (optional)

To expose via a domain with HTTPS:

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

The `/api/` proxy to the backend is handled internally by the frontend container.

## Environment Variables

| Variable      | Description                        | Example                        |
|---------------|------------------------------------|--------------------------------|
| SAB_URL       | SABnzbd base URL (no trailing /)   | http://192.168.1.10:8080       |
| SAB_API_KEY   | SABnzbd API key                    | abc123...                      |
| PORT          | Backend internal port              | 3000                           |

## Project Structure

```
cyberbabasab/
  backend/
    src/
      index.ts              - Express server + Socket.IO
      routes/
        sab.routes.ts       - All API routes
      services/
        sab.service.ts      - SABnzbd API client
    package.json
    tsconfig.json
    Dockerfile
  frontend/
    src/
      App.tsx
      i18n.ts               - Translations (fr/en/es/it/de)
      components/           - Shared components
      hooks/
        useSab.ts           - SABnzbd data hooks
        usePrefs.ts         - User preferences
      pages/                - Dashboard, Queue, History, Servers...
      widgets/              - SpeedWidget, StatsWidget
    public/
      logo.png              - Replace with your logo
    nginx.conf              - Nginx config inside Docker
    package.json
    vite.config.ts
    Dockerfile
  docker-compose.yml
  .env.example
```

## Customization

All UI preferences are stored in browser localStorage:

- Dark / Light theme
- Accent color
- Language
- App name and logo URL
- Refresh interval (1s to 10s)
- Number of jobs shown on dashboard
- Compact mode
- Speed unit (MB/s or KB/s)
- Browser notifications

## License

MIT
