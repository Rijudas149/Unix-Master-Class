import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { ProgressState, TopicProgress, PracticeStatus, Bookmark, BookmarkType, Topic } from '../types'
import { allTopics } from '../data/curriculum'
import { getPracticeStats } from '../data/practiceQuestions'

const defaultProgress: ProgressState = {
  topics: {},
  practice: {},
  totalStudySeconds: 0,
  totalPracticeSeconds: 0,
  studySessions: 0,
  practiceSessions: 0,
  studyStreak: 0,
  lastStudyDate: undefined,
  bookmarks: [],
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function updateStreak(prev: ProgressState): Pick<ProgressState, 'studyStreak' | 'lastStudyDate'> {
  const today = todayKey()
  if (prev.lastStudyDate === today) {
    return { studyStreak: prev.studyStreak ?? 1, lastStudyDate: today }
  }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)
  const streak = prev.lastStudyDate === yesterdayKey ? (prev.studyStreak ?? 0) + 1 : 1
  return { studyStreak: streak, lastStudyDate: today }
}

function migratePracticeProgress(state: ProgressState): ProgressState {
  const practice = { ...state.practice }
  let changed = false
  for (const [id, p] of Object.entries(practice)) {
    if (!p.status && p.solved) {
      practice[id] = { ...p, status: 'done' }
      changed = true
    } else if (!p.status) {
      practice[id] = { ...p, status: 'due' }
      changed = true
    }
  }
  const bookmarks = state.bookmarks ?? []
  return changed ? { ...state, practice, bookmarks } : { ...state, bookmarks }
}

interface ProgressContextType {
  progress: ProgressState
  markSectionComplete: (topicId: string, sectionId: string) => void
  markExerciseComplete: (topicId: string, exerciseId: string) => void
  markTopicComplete: (topicId: string) => void
  setPracticeStatus: (questionId: string, status: PracticeStatus) => void
  addStudyTime: (seconds: number, topicId?: string) => void
  addPracticeTime: (seconds: number, questionId?: string) => void
  getTopicProgress: (topicId: string) => TopicProgress
  getOverallStudyProgress: () => number
  getOverallPracticeProgress: () => number
  getPracticeStats: () => { done: number; failed: number; due: number; total: number }
  getModuleProgress: (module: string) => { study: number; practice: number }
  getContinueTopic: () => Topic | undefined
  getStudyStreak: () => number
  isBookmarked: (type: BookmarkType, id: string) => boolean
  toggleBookmark: (type: BookmarkType, id: string) => void
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | null>(null)

function ensureTopicProgress(state: ProgressState, topicId: string): TopicProgress {
  return (
    state.topics[topicId] ?? {
      topicId,
      sectionsCompleted: [],
      exercisesCompleted: [],
      studyTimeSeconds: 0,
      lastVisited: new Date().toISOString(),
      completed: false,
    }
  )
}

function ensurePracticeProgress(state: ProgressState, questionId: string) {
  return (
    state.practice[questionId] ?? {
      questionId,
      status: 'due' as PracticeStatus,
      attempts: 0,
      practiceTimeSeconds: 0,
      lastAttempt: new Date().toISOString(),
    }
  )
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [rawProgress, setProgress] = useLocalStorage<ProgressState>(
    'unix-teacher-progress',
    defaultProgress,
  )
  const progress = migratePracticeProgress(rawProgress)

  const markSectionComplete = useCallback((topicId: string, sectionId: string) => {
    setProgress((prev) => {
      const tp = ensureTopicProgress(prev, topicId)
      if (tp.sectionsCompleted.includes(sectionId)) return prev
      const topic = allTopics.find((t) => t.id === topicId)
      const sectionsCompleted = [...tp.sectionsCompleted, sectionId]
      const allSectionsDone = topic
        ? sectionsCompleted.length >= topic.sections.length
        : false
      return {
        ...prev,
        ...updateStreak(prev),
        topics: {
          ...prev.topics,
          [topicId]: {
            ...tp,
            sectionsCompleted,
            lastVisited: new Date().toISOString(),
            completed: allSectionsDone && tp.exercisesCompleted.length >= (topic?.exercises.length ?? 0),
          },
        },
      }
    })
  }, [setProgress])

  const markExerciseComplete = useCallback((topicId: string, exerciseId: string) => {
    setProgress((prev) => {
      const tp = ensureTopicProgress(prev, topicId)
      if (tp.exercisesCompleted.includes(exerciseId)) return prev
      const topic = allTopics.find((t) => t.id === topicId)
      const exercisesCompleted = [...tp.exercisesCompleted, exerciseId]
      const allExercisesDone = topic
        ? exercisesCompleted.length >= topic.exercises.length
        : false
      return {
        ...prev,
        ...updateStreak(prev),
        topics: {
          ...prev.topics,
          [topicId]: {
            ...tp,
            exercisesCompleted,
            lastVisited: new Date().toISOString(),
            completed:
              allExercisesDone && tp.sectionsCompleted.length >= (topic?.sections.length ?? 0),
          },
        },
      }
    })
  }, [setProgress])

  const markTopicComplete = useCallback((topicId: string) => {
    setProgress((prev) => {
      const topic = allTopics.find((t) => t.id === topicId)
      if (!topic) return prev
      return {
        ...prev,
        ...updateStreak(prev),
        topics: {
          ...prev.topics,
          [topicId]: {
            ...ensureTopicProgress(prev, topicId),
            sectionsCompleted: topic.sections.map((s) => s.id),
            exercisesCompleted: topic.exercises.map((e) => e.id),
            completed: true,
            lastVisited: new Date().toISOString(),
          },
        },
      }
    })
  }, [setProgress])

  const setPracticeStatus = useCallback((questionId: string, status: PracticeStatus) => {
    setProgress((prev) => {
      const existing = ensurePracticeProgress(prev, questionId)
      return {
        ...prev,
        ...(status === 'done' ? updateStreak(prev) : {}),
        practice: {
          ...prev.practice,
          [questionId]: {
            ...existing,
            status,
            solved: status === 'done',
            attempts: existing.attempts + (status !== 'due' ? 1 : 0),
            lastAttempt: new Date().toISOString(),
          },
        },
      }
    })
  }, [setProgress])

  const addStudyTime = useCallback((seconds: number, topicId?: string) => {
    if (seconds <= 0) return
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        totalStudySeconds: prev.totalStudySeconds + seconds,
        ...updateStreak(prev),
      }
      if (topicId) {
        const tp = ensureTopicProgress(prev, topicId)
        next.topics = {
          ...prev.topics,
          [topicId]: {
            ...tp,
            studyTimeSeconds: tp.studyTimeSeconds + seconds,
            lastVisited: new Date().toISOString(),
          },
        }
      }
      return next
    })
  }, [setProgress])

  const addPracticeTime = useCallback((seconds: number, questionId?: string) => {
    setProgress((prev) => {
      const next = { ...prev, totalPracticeSeconds: prev.totalPracticeSeconds + seconds }
      if (questionId) {
        const existing = ensurePracticeProgress(prev, questionId)
        next.practice = {
          ...prev.practice,
          [questionId]: {
            ...existing,
            practiceTimeSeconds: existing.practiceTimeSeconds + seconds,
            lastAttempt: new Date().toISOString(),
          },
        }
      }
      return next
    })
  }, [setProgress])

  const getTopicProgress = useCallback(
    (topicId: string) => ensureTopicProgress(progress, topicId),
    [progress],
  )

  const getOverallStudyProgress = useCallback(() => {
    if (allTopics.length === 0) return 0
    const completed = allTopics.filter((t) => progress.topics[t.id]?.completed).length
    return Math.round((completed / allTopics.length) * 100)
  }, [progress])

  const getOverallPracticeProgress = useCallback(() => {
    const stats = getPracticeStats(progress.practice)
    if (stats.total === 0) return 0
    return Math.round((stats.done / stats.total) * 100)
  }, [progress])

  const getPracticeStatsFn = useCallback(
    () => getPracticeStats(progress.practice),
    [progress],
  )

  const getModuleProgress = useCallback(
    (module: string) => {
      const moduleTopics = allTopics.filter((t) => t.module === module)
      if (moduleTopics.length === 0) return { study: 0, practice: 0 }
      const studyCompleted = moduleTopics.filter((t) => progress.topics[t.id]?.completed).length
      return {
        study: Math.round((studyCompleted / moduleTopics.length) * 100),
        practice: 0,
      }
    },
    [progress],
  )

  const getContinueTopic = useCallback((): Topic | undefined => {
    const visited = allTopics
      .filter((t) => {
        const tp = progress.topics[t.id]
        return tp && !tp.completed && (tp.sectionsCompleted.length > 0 || tp.studyTimeSeconds > 0)
      })
      .sort((a, b) => {
        const aTime = new Date(progress.topics[a.id]?.lastVisited ?? 0).getTime()
        const bTime = new Date(progress.topics[b.id]?.lastVisited ?? 0).getTime()
        return bTime - aTime
      })
    if (visited.length > 0) return visited[0]
    return allTopics.find((t) => !progress.topics[t.id]?.completed)
  }, [progress])

  const getStudyStreak = useCallback(() => {
    const today = todayKey()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const streak = progress.studyStreak ?? 0
    if (progress.lastStudyDate === today || progress.lastStudyDate === yesterdayKey) {
      return streak
    }
    return 0
  }, [progress])

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) =>
      (progress.bookmarks ?? []).some((b) => b.type === type && b.id === id),
    [progress.bookmarks],
  )

  const toggleBookmark = useCallback((type: BookmarkType, id: string) => {
    setProgress((prev) => {
      const bookmarks = prev.bookmarks ?? []
      const exists = bookmarks.some((b) => b.type === type && b.id === id)
      const next: Bookmark[] = exists
        ? bookmarks.filter((b) => !(b.type === type && b.id === id))
        : [...bookmarks, { type, id }]
      return { ...prev, bookmarks: next }
    })
  }, [setProgress])

  const resetProgress = useCallback(() => setProgress(defaultProgress), [setProgress])

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markSectionComplete,
        markExerciseComplete,
        markTopicComplete,
        setPracticeStatus,
        addStudyTime,
        addPracticeTime,
        getTopicProgress,
        getOverallStudyProgress,
        getOverallPracticeProgress,
        getPracticeStats: getPracticeStatsFn,
        getModuleProgress,
        getContinueTopic,
        getStudyStreak,
        isBookmarked,
        toggleBookmark,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
