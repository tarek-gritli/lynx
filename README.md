<div align="center">
    <img src="assets/lynx_logo.png" alt="Lynx Logo" width="300" height="300" />
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

## Quick Setup

Copy `.env.example` to `.env` and configure. Both backend and frontend read from the root `.env` file.

## Support

- 🐞 **Issues**: [GitHub Issues](https://github.com/tarek-gritli/lynx/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/tarek-gritli/lynx/discussions)
