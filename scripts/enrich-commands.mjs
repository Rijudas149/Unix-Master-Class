import fs from 'fs'
import path from 'path'
import { inferType, generatePatterns, COMMAND_TYPES } from './lib/enrichment.mjs'
import { buildFullExplanation } from './lib/explanations.mjs'

const rootDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..')
const commandsPath = path.join(rootDir, 'src', 'data', 'commands.json')

const raw = JSON.parse(fs.readFileSync(commandsPath, 'utf8'))
const enriched = raw.map((cmd) => {
  const type = inferType(cmd)
  const patterns = generatePatterns(cmd)
  const explanation = buildFullExplanation(cmd, type)
  return {
    ...cmd,
    type,
    explanation,
    patterns,
    pattern: patterns[0]?.pattern ?? cmd.pattern,
    example: patterns[0]?.example ?? cmd.example,
  }
})

fs.writeFileSync(commandsPath, JSON.stringify(enriched, null, 2))

const typeCounts = {}
let totalPatterns = 0
for (const cmd of enriched) {
  typeCounts[cmd.type] = (typeCounts[cmd.type] ?? 0) + 1
  totalPatterns += cmd.patterns.length
}

console.log(`Enriched ${enriched.length} commands`)
console.log(`Total patterns: ${totalPatterns} (avg ${(totalPatterns / enriched.length).toFixed(1)} per command)`)
console.log('Types:', typeCounts)
console.log('Available types:', COMMAND_TYPES.join(', '))
