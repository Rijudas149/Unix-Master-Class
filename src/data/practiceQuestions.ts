import type { ExternalPracticeQuestion } from '../types'
import externalData from './externalQuestions.json'

export const practiceQuestions: ExternalPracticeQuestion[] = externalData as ExternalPracticeQuestion[]

export const practiceCategories = [...new Set(practiceQuestions.map((q) => q.category))].sort()

export const platformLabels: Record<string, string> = {
  overthewire: 'OverTheWire',
  exercism: 'Exercism',
  hackerrank: 'HackerRank',
  leetcode: 'LeetCode',
  geeksforgeeks: 'GeeksforGeeks',
  codewars: 'Codewars',
  cmdchallenge: 'CMD Challenge',
}

export function getPracticeStats(progress: Record<string, { status?: string; solved?: boolean }>) {
  const done = practiceQuestions.filter((q) => {
    const p = progress[q.id]
    return p?.status === 'done' || p?.solved
  }).length
  const failed = practiceQuestions.filter((q) => progress[q.id]?.status === 'failed').length
  const due = practiceQuestions.length - done - failed
  return { done, failed, due, total: practiceQuestions.length }
}
