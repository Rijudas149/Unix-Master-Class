import { scenarios } from '../index'
import type { FactCategory, FactScenario, Scenario } from '../../types'

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  pipes: {
    name: 'Pipes & Redirection',
    description: 'Chain commands, redirect streams, and build powerful one-liners.',
  },
  logs: {
    name: 'Log Analysis',
    description: 'Parse, filter, and troubleshoot application and system logs.',
  },
  grep: {
    name: 'Search & Filter',
    description: 'Find patterns in files and command output with grep and friends.',
  },
  nginx: {
    name: 'Web Server Ops',
    description: 'Common nginx and web server administration patterns.',
  },
  process: {
    name: 'Process Management',
    description: 'Monitor, kill, and manage running processes.',
  },
  files: {
    name: 'File Operations',
    description: 'Copy, move, find, and manipulate files and directories.',
  },
  permissions: {
    name: 'Permissions & Security',
    description: 'Manage ownership, access control, and security hardening.',
  },
  network: {
    name: 'Networking',
    description: 'Connect, transfer, and diagnose network issues.',
  },
  devops: {
    name: 'DevOps & Automation',
    description: 'Deployment, CI/CD, and infrastructure automation patterns.',
  },
  docker: {
    name: 'Containers',
    description: 'Docker and container orchestration shell patterns.',
  },
  kubernetes: {
    name: 'Kubernetes',
    description: 'kubectl and K8s cluster administration commands.',
  },
  general: {
    name: 'General Scenarios',
    description: 'Everyday Unix/Linux command-line patterns for developers and sysadmins.',
  },
}

function mapDifficulty(d: Scenario['difficulty']): FactScenario['level'] {
  if (d === 'basic' || d === 'intermediate') return 'intermediate'
  if (d === 'advanced') return 'advanced'
  return 'expert'
}

function resolveCategoryId(tags: string[]): string {
  for (const tag of tags) {
    if (CATEGORY_META[tag]) return tag
  }
  return 'general'
}

function scenarioToFact(s: Scenario): FactScenario {
  const categoryId = resolveCategoryId(s.tags)
  const meta = CATEGORY_META[categoryId] ?? CATEGORY_META.general

  return {
    id: s.id,
    title: s.scenario,
    description: s.scenario,
    category: meta.name,
    level: mapDifficulty(s.difficulty),
    tags: s.tags,
    explanation: `**Scenario:** ${s.scenario}

This is a real-world pattern you'll encounter when working on Unix/Linux systems. The **code pattern** shows the reusable template; the **example** shows a concrete command you can run (adjust paths for your environment).

**When to use:** ${s.tags.join(', ')} tasks at the **${s.difficulty}** level.`,
    mainCode: s.codePattern,
    exampleCode: s.example,
    keyPoints: [
      `Pattern: \`${s.codePattern}\``,
      `Difficulty: ${s.difficulty}`,
      ...s.tags.slice(0, 3).map((t) => `Tag: ${t}`),
    ],
  }
}

function buildFacts() {
  const byCategory = new Map<string, FactScenario[]>()

  for (const s of scenarios) {
    const fact = scenarioToFact(s)
    const catId = resolveCategoryId(s.tags)
    const list = byCategory.get(catId) ?? []
    list.push(fact)
    byCategory.set(catId, list)
  }

  const factCategories: FactCategory[] = []
  for (const [id, list] of byCategory) {
    const meta = CATEGORY_META[id] ?? CATEGORY_META.general
    factCategories.push({
      id,
      name: meta.name,
      description: meta.description,
      scenarios: list,
    })
  }

  factCategories.sort((a, b) => b.scenarios.length - a.scenarios.length)
  const allScenarios = factCategories.flatMap((c) => c.scenarios)

  return { factCategories, allScenarios }
}

const { factCategories, allScenarios } = buildFacts()

export { factCategories, allScenarios }

export function getScenarioById(id: string) {
  return allScenarios.find((s) => s.id === id)
}

export function getCategoryForScenario(scenarioId: string) {
  return factCategories.find((c) => c.scenarios.some((s) => s.id === scenarioId))
}

export function getAdjacentScenarios(scenarioId: string) {
  for (const cat of factCategories) {
    const idx = cat.scenarios.findIndex((s) => s.id === scenarioId)
    if (idx >= 0) {
      return {
        prev: idx > 0 ? cat.scenarios[idx - 1] : undefined,
        next: idx < cat.scenarios.length - 1 ? cat.scenarios[idx + 1] : undefined,
      }
    }
  }
  return {}
}
