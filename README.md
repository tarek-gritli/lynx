<div align="center">
    <img src="assets/lynx.png" alt="Lynx Logo" width="300" height="300" />
</div>

<p align="center">
  <strong>Sharp-eyed AI code review for PRs/MRs using your own LLM API keys.</strong>
</p>

<p align="center">
<a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.12+-blue.svg" alt="Python"></a>
<a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.128-009688.svg" alt="FastAPI"></a>
<a href="https://www.docker.com/"><img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker"></a>

</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#support">Support</a>
</p>

---

## Why Lynx?

- **🔐 Your Data, Your Server** — Code never leaves your infrastructure
- **🤖 Multi-Agent Reviews** — Get perspectives from OpenAI, Gemini, and Claude
- **⚡ Zero Vendor Lock-in** — Bring your own API keys, switch providers anytime
- **🌐 Multi-Platform** — GitHub and GitLab (cloud + self-hosted)
- **🧩 API-First** — Clean REST API, ready for your own dashboard

---

## Features

- **Code Review:** Auto-reviews on PRs/MRs, manual `/review` trigger, focuses on security, bugs & performance

- **Platform Support:** GitHub (via App) & GitLab (cloud + self-hosted)

- **LLM Providers:** OpenAI, Gemini, Claude

- **Security:** OAuth 2.0, encrypted API keys (Fernet), webhook signature verification

## Deployment

### Option 1: Development (Local)

For local development without HTTPS:

```bash
# Copy and configure environment
cp .env.example .env

# Start services
docker-compose -f docker-compose.dev.yml up -d
```

Access at `http://localhost:5173` (frontend) and `http://localhost:8000` (backend)

### Option 2: Production with Existing Traefik

If you already have Traefik running with a `proxy` network:

```bash
# Configure .env with your domain
DOMAIN_NAME=yourdomain.com
VITE_API_URL=https://yourdomain.com/api/v1
BACKEND_URL=https://yourdomain.com/api/v1
FRONTEND_URL=https://yourdomain.com
COOKIE_SECURE=True
COOKIE_SAMESITE=lax

# Start services
docker-compose up -d
```

### Option 3: Production with Fresh Traefik

First, deploy Traefik:

```bash
# Configure Traefik credentials
SSL_EMAIL=your@email.com
DOMAIN_NAME=yourdomain.com
CF_DNS_API_TOKEN=your_cloudflare_api_token
# Start Traefik
docker-compose -f docker-compose.traefik.yml up -d
```

Then deploy Lynx using Option 2 above.

## Future Enhancements

- **In-App Notifications**: Real-time notifications for review completion, failures, and important events

## Support

- 🐞 **Issues**: [GitHub Issues](https://github.com/tarek-gritli/lynx/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/tarek-gritli/lynx/discussions)
