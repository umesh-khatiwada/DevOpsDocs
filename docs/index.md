---
title: Home
description: Field-tested DevOps, platform engineering and AI automation guides by Umesh Khatiwada.
hide:
  - navigation
  - toc
---

<div class="uk-hero" markdown>
<span class="uk-hello">namaste! welcome to the notes</span>

<h1 class="uk-display">Guides for platforms that <span class="uk-mark">ship themselves.<svg aria-hidden="true" viewBox="0 0 300 24" preserveAspectRatio="none"><path d="M4 16 C 60 6, 120 4, 180 10 S 270 18, 296 8" fill="none" stroke-width="9" stroke-linecap="round"/></svg></span></h1>

<p class="uk-lead">Hands-on write-ups from running Kubernetes in production: monitoring, logging, security, autoscaling, multi-cluster, backups, and AI agents. Every guide is copy-paste friendly and tested on real clusters.</p>

<div class="uk-actions" markdown>
[Browse the guides](#guides){ .md-button .md-button--primary }
[About me ↗](https://umeshkhatiwada.com.np){ .md-button }
</div>
</div>

<div class="uk-section-head" markdown>
<h2 id="guides">The guides</h2>
<p>Pick a topic. Each one starts from zero and ends with something running.</p>
</div>

<div class="uk-grid" markdown>

<div class="uk-card" markdown>
<span class="uk-card__num">01</span>

### [Monitoring](<Monitoring/1. setup_prometheus-grafana.md>)

Prometheus and Grafana on Kubernetes, with Alertmanager routing to Google Chat and Slack.

<span class="uk-tags">Prometheus · Grafana · Alertmanager</span>
</div>

<div class="uk-card" markdown>
<span class="uk-card__num">02</span>

### [Logging](Logging/kafka.md)

Event streaming with Apache Kafka: brokers, topics and getting logs flowing.

<span class="uk-tags">Kafka · Streaming</span>
</div>

<div class="uk-card" markdown>
<span class="uk-card__num">03</span>

### [Security](Security/KubeScape.md)

Scan clusters for misconfigurations, then sign and verify every image before it runs.

<span class="uk-tags">Kubescape · M9Sweeper · Cosign · Kyverno</span>
</div>

<div class="uk-card" markdown>
<span class="uk-card__num">04</span>

### [Platform](Platform/keda.md)

Event-driven autoscaling, ingress routing and fixes for the certificates that expire at 3 a.m.

<span class="uk-tags">KEDA · Traefik · Contour</span>
</div>

<div class="uk-card" markdown>
<span class="uk-card__num">05</span>

### [Multi-cluster & DR](MultiCluster/Karmada.md)

Spread workloads across clusters with Karmada and back them up with Kasten K10.

<span class="uk-tags">Karmada · Kasten K10</span>
</div>

<div class="uk-card" markdown>
<span class="uk-card__num">06</span>

### [Agentic AI](AgenticAI/agentic-ai.md)

AI agents that work alongside ops: the Model Context Protocol, and security agents.

<span class="uk-tags">MCP · AI agents · CAI</span>
</div>

</div>

<div class="uk-section-head" markdown>
<h2 id="how-to-read">The short version</h2>
</div>

<div class="uk-rows" markdown>
<div class="uk-row" markdown>
<span class="uk-eyebrow">Find</span>

Press <kbd>/</kbd> or <kbd>S</kbd> to search every guide, command and YAML snippet.
</div>

<div class="uk-row" markdown>
<span class="uk-eyebrow">Copy</span>

Every code block has a copy button. Values like namespaces and hostnames are examples, so change them to match your cluster.
</div>

<div class="uk-row" markdown>
<span class="uk-eyebrow">Improve</span>

Spotted a mistake? Use the pencil icon on any page to suggest an edit on [GitHub](https://github.com/umesh-khatiwada/DevOpsDocs).
</div>

</div>

<div class="uk-cta" markdown>
<span class="uk-eyebrow">Work together</span>

<h2 id="hire">Need a hand with your platform?</h2>

<p>I help teams move to Kubernetes, build GitOps pipelines and add AI automation that watches production for them.</p>

<div class="uk-actions" markdown>
[Start a project](https://umeshkhatiwada.com.np/hire){ .md-button .md-button--primary }
[Email me](mailto:contact.khatiwada@gmail.com){ .md-button }
</div>
</div>
