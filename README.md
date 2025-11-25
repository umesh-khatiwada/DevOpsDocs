# DevOpsDocs
A one-stop hub for all your DevOps documentation needs, containing helpful guides, how-to tutorials, and best practices.

## Installation & Build

- **Clone:** Pull the repository to your machine.

	```bash
	git clone <repo-url>
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

- The repository contains example images and some docs under `docs/assets/` that may not be listed in the site navigation (`mkdocs.yml`). Add them to the `nav` section if you want them visible in the site menu.
- If MkDocs reports missing images or unrecognized relative links, check that image paths under `docs/` point to existing files in `docs/assets/images/` (or correct the references).
- The project uses `mkdocs-material` theme; refer to `mkdocs.yml` for theme and plugin configuration.

If you'd like, I can also:
- Add the currently-unused `docs/assets/*.md` files into the `nav` in `mkdocs.yml`.
- Serve the site locally now for review.
- Publish the built `site/` to GitHub Pages.

