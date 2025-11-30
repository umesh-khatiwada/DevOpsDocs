---
# DevOps Documentation

<div class="hero" role="region" aria-label="DevOps Documentation hero">
	<div class="hero-content">
		<h1 class="hero-title">DevOps Documentation</h1>
		<p class="lead">A curated collection of guides, tutorials, and best practices to help you build, operate, and secure production-grade DevOps systems.</p>
	</div>
	<div class="hero-actions">
		<button id="theme-toggle" class="btn-toggle" aria-pressed="false" title="Toggle theme">🌙</button>
	</div>
</div>

**Overview**

This documentation repository is organized by topic to help you quickly find practical guides and reference material for operating cloud-native systems.

**Contents snapshot**

- Monitoring: Prometheus, Grafana, alerting and integrations.
- Logging: Kafka, Loki, collection patterns and observability.
- Security: Scanning, hardening and tools like KubeScape and M9Sweeper.
- Traefik: Ingress examples, dashboards and routing patterns.
- Backup & Restore: Kasten examples and recovery strategies.
- Multi-cluster: Karmada and cross-cluster orchestration.

---

## Quick links

Click a card to open the full guide.

<div class="feature-cards">
	<div class="feature-card"><strong><a href="Monitoring/1.%20setup_prometheus-grafana.md">Monitoring</a></strong><p>Prometheus & Grafana, integrations and alerts.</p></div>
	<div class="feature-card"><strong><a href="Logging/kafka.md">Logging</a></strong><p>Kafka, Loki and log collection patterns.</p></div>
	<div class="feature-card"><strong><a href="Security/KubeScape.md">Security</a></strong><p>Cluster scanning and remediation tools.</p></div>
	<div class="feature-card"><strong><a href="Traefik/Traefik.md">Traefik</a></strong><p>Ingress, routing and middleware examples.</p></div>
	<div class="feature-card"><strong><a href="MultiCluster/Karmada.md">MultiCluster</a></strong><p>Multi-cluster orchestration and policies.</p></div>
	<div class="feature-card"><strong><a href="Backup&Restore/kasten.md">Backup & Restore</a></strong><p>Kasten workflows and restore procedures.</p></div>
</div>

---

## Getting started

1. Browse the quick links above to find a topic.
2. Use the search in the site header to locate keywords across guides.
3. Open examples and copy snippets into your environment.

## Contribute

Contributions are welcome — open a PR with improvements, fixes, or screenshots. Add guides under the matching category folder (`Monitoring/`, `Logging/`, `Security/`, etc.).

## Contact

For help or questions, open an issue in this repository or reach out to the documentation maintainers.

<script>
// Theme toggle: adds `data-theme="dark"` on the document element and persists choice.
(function(){
	const btn = document.getElementById('theme-toggle');
	if(!btn) return;
	const root = document.documentElement;
	const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	const saved = localStorage.getItem('site-theme');
	if(saved) root.setAttribute('data-theme', saved);
	else if(prefersDark) root.setAttribute('data-theme','dark');

	function update() {
		const isDark = root.getAttribute('data-theme') === 'dark';
		btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
		btn.setAttribute('aria-pressed', String(isDark));
	}

	btn.addEventListener('click', function(){
		const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		localStorage.setItem('site-theme', next);
		update();
	});

	update();
})();
</script>

---

If you'd like screenshots, badges, or a different landing layout, tell me which sections to prioritize.