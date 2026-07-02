import commandsData from './commands.json'
import scenariosData from './scenarios.json'
import type { UnixCommand, Scenario } from '../types'

export const commands: UnixCommand[] = commandsData as UnixCommand[]
export const scenarios: Scenario[] = scenariosData as Scenario[]

export function getCommandStats() {
  const categories = new Map<string, number>()
  for (const cmd of commands) {
    categories.set(cmd.category, (categories.get(cmd.category) ?? 0) + 1)
  }
  return { total: commands.length, categories }
}

export function getScenarioStats() {
  const byDifficulty = { basic: 0, intermediate: 0, advanced: 0, expert: 0 }
  for (const s of scenarios) {
    byDifficulty[s.difficulty]++
  }
  return { total: scenarios.length, byDifficulty }
}
