# DevOpsDocs

A one-stop hub for all your DevOps documentation needs, containing helpful guides, how-to tutorials, and best practices. Built with MkDocs (Material theme) and published at https://blog.umeshkhatiwada.com.np (per `site_url` in `mkdocs.yml`).

## Table of contents

- [Guides](#guides)
- [Repository structure](#repository-structure)
- [Installation & Build](#installation--build)
- [Notes & Troubleshooting](#notes--troubleshooting)
- [Theme](#theme)
- [License](#license)
- [Author](#author)

## Guides

Source files live under `docs/`. The site navigation (`mkdocs.yml`) groups them as follows.

| Section | Guide |
|---------|-------|
| Monitoring | [Prometheus & Grafana](docs/Monitoring/1.%20setup_prometheus-grafana.md), [Google Chat alerts](docs/Monitoring/2.%20gmail_integration.md), [Slack alerts](docs/Monitoring/3.%20slack_integration.md) |
| Logging | [Kafka](docs/Logging/kafka.md), [Loki](docs/Logging/loki.md) |
| Security | [Kubescape](docs/Security/KubeScape.md), [M9Sweeper](docs/Security/M9Sweeper.md), [Signed images (Kaniko, Cosign, Kyverno)](docs/Platform/docker-image-security.md), [Keycloak + Kong JWT auth](docs/Security/keycloak-kong.md) |
| Platform | [KEDA autoscaling](docs/Platform/keda.md), [Traefik](docs/Traefik/Traefik.md), [Karmada multi-cluster](docs/MultiCluster/Karmada.md), [Kasten backup & restore](docs/Backup&Restore/kasten.md), [Expired Contour certs fix](docs/Troubleshoots/How%20to%20rotate%20and%20renew%20expired%20Contou.md) |
| Agentic AI | [Agentic AI](docs/AgenticAI/agentic-ai.md), [Introduction to MCP](docs/AgenticAI/introduction-to-mcp.md), [KAgent](docs/AgenticAI/kagent.md), [Agent Gateway](docs/AgenticAI/agent-gateway.md), [CAI cybersecurity agent](docs/AgenticAI/cai-cybersecurity-agent.md) |

## Repository structure

```
.
├── docs/             # Markdown sources, grouped by topic, plus assets/ (images, CSS, logo)
├── overrides/        # Material theme overrides (main.html, partials/)
├── mkdocs.yml        # Site config and navigation
├── requirements.txt  # Python dependencies
├── CNAME             # Custom domain for GitHub Pages
└── site/             # Committed build output of `mkdocs build`
```

## Installation & Build

- **Clone:** Pull the repository to your machine.

	```bash
	git clone https://github.com/umesh-khatiwada/DevOpsDocs.git
	cd DevOpsDocs
	```

- **Create virtualenv:** (this project uses a local virtual environment named `.env` and `.env` is in `.gitignore`)

	```bash
	python3 -m venv .env
	source .env/bin/activate
	```

- **Install dependencies:** Install packages from `requirements.txt`.

	```bash
	pip install --upgrade pip
	pip install -r requirements.txt
	```

- **Optional plugin:** If MkDocs build fails complaining about the `minify` plugin, install it:

	```bash
	pip install mkdocs-minify-plugin
	```

- **Build the site:** Build into the `site/` directory.

	```bash
	# while virtualenv is activated
	mkdocs build --clean

	# or call the binary directly without activating
	./.env/bin/mkdocs build --clean
	```

- **Serve locally:** Preview with live reload.

	```bash
	mkdocs serve
	# or
	./.env/bin/mkdocs serve
	```

- **Publish to GitHub Pages:** `ghp-import` is available in the virtualenv. Example:

	```bash
	./.env/bin/ghp-import -n -p -f site
	```

## Notes & Troubleshooting

- Every guide under `docs/` is listed in the `nav` section of `mkdocs.yml`. When you add a new page, add it there too, or it won't appear in the site menu. `docs/assets/` holds only images, CSS and the logo.
- If MkDocs reports missing images or unrecognized relative links, check that image paths under `docs/` point to existing files in `docs/assets/images/` (or correct the references).
- The project uses `mkdocs-material` theme; refer to `mkdocs.yml` for theme and plugin configuration.

## Theme

The look matches [umeshkhatiwada.com.np](https://umeshkhatiwada.com.np): paper and coal neutrals, a clay accent, Fraunces headings, DM Sans body text and Caveat accents.

- `docs/assets/stylesheets/custom.css` holds the brand tokens (`--uk-*`), the light and dark palettes, and the home page components (`uk-card`, `uk-row`, `uk-cta`).
- `overrides/main.html` loads the display fonts and adds social meta tags.
- `overrides/partials/logo.html` renders the "Umesh. *the blog*" wordmark.
- Buttons in Markdown: `[Text](url){ .md-button .md-button--primary }`.
- Each page can set `description:` in its front matter for search and social previews.

## License

MIT. See [LICENSE](LICENSE).

## Author

Umesh Khatiwada - [@umesh-khatiwada](https://github.com/umesh-khatiwada)
