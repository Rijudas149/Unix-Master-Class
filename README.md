# Unix Teacher

Interactive web app to learn Unix/Linux from zero to hero.

## Features

- **495+ Commands** — name, explanation, usage pattern, and copyable example
- **204 Developer Scenarios** — real-world Facts section (DevOps, K8s, security, logs, etc.)
- **Day/Night Mode** — persisted theme toggle
- **Interactive Learning Path** — 8-module curriculum with mini quiz
- **Search & Filters** — by category, difficulty, tags

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Regenerate Data

```bash
node scripts/generate-data.mjs    # regenerate commands + scenarios
node scripts/enrich-commands.mjs  # re-apply type + patterns enrichment
```

Each command includes:
- **type** — Shell Builtin, GNU Coreutils, Container CLI, etc.
- **patterns[]** — multiple usage variants with label, syntax, and example

## Sections

| Section | Description |
|---------|-------------|
| **Home** | Overview, stats, featured commands & scenarios |
| **Commands** | Full command reference with expandable cards |
| **Facts** | 200+ developer scenarios with code patterns |
| **Learn** | Structured 8-step learning path + quiz |
