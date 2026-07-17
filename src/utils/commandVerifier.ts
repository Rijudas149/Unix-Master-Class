/** Normalize shell commands for comparison — strips comments, extra whitespace. */
export function normalizeCommand(cmd: string): string {
  return cmd
    .replace(/#[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTokens(normalized: string): string[] {
  const tokens = normalized.match(/[a-zA-Z0-9._\-/|><&*?~$"'[\]]+/g)
  return (tokens ?? []).map((t) => t.toLowerCase())
}

function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(extractTokens(a))
  const tb = new Set(extractTokens(b))
  if (ta.size === 0 && tb.size === 0) return 0
  let match = 0
  for (const t of ta) if (tb.has(t)) match++
  return match / Math.max(ta.size, tb.size)
}

export interface VerifyResult {
  correct: boolean
  message: string
  similarity: number
}

export function verifyCommand(
  userCode: string,
  solution: string,
  alternateSolutions: string[] = [],
): VerifyResult {
  if (!userCode.trim()) {
    return { correct: false, message: 'Please write your command before checking.', similarity: 0 }
  }

  const userNorm = normalizeCommand(userCode)
  const allSolutions = [solution, ...alternateSolutions].map(normalizeCommand).filter(Boolean)

  for (const expected of allSolutions) {
    if (userNorm === expected) {
      return { correct: true, message: 'Correct! Your command matches the expected answer.', similarity: 1 }
    }
  }

  let bestSim = 0
  let bestSol = allSolutions[0] ?? ''
  for (const expected of allSolutions) {
    const sim = tokenSimilarity(userNorm, expected)
    if (sim > bestSim) {
      bestSim = sim
      bestSol = expected
    }
  }

  const userCmd = userNorm.split(/[\s|]/)[0]
  const expCmd = bestSol.split(/[\s|]/)[0]

  if (bestSim >= 0.85 && userCmd === expCmd) {
    return {
      correct: true,
      message: 'Looks correct! Your command is equivalent (minor formatting differences).',
      similarity: bestSim,
    }
  }

  if (bestSim >= 0.6) {
    return {
      correct: false,
      message: `Close, but not quite right (${Math.round(bestSim * 100)}% match). Check flags, paths, or argument order. Use Hint or Show Solution if stuck.`,
      similarity: bestSim,
    }
  }

  return {
    correct: false,
    message: 'Not correct yet. Review the lesson material, try the Hint, or compare with the solution.',
    similarity: bestSim,
  }
}
