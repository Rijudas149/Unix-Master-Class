export type CommandType =
  | 'Shell Builtin'
  | 'Shell Operator'
  | 'POSIX Utility'
  | 'GNU Coreutils'
  | 'Filter / Stream Processor'
  | 'Network Utility'
  | 'Process Utility'
  | 'Filesystem Utility'
  | 'System Utility'
  | 'Linux Specific'
  | 'BSD / macOS Utility'
  | 'Security Tool'
  | 'Archive Utility'
  | 'Package Manager'
  | 'Development Tool'
  | 'Container CLI'
  | 'Kubernetes CLI'
  | 'Cloud CLI'
  | 'Database Client'
  | 'Monitoring Utility'
  | 'Text Utility'

export interface CommandPattern {
  label: string
  pattern: string
  example: string
}

export interface UnixCommand {
  id: string
  name: string
  explanation: string
  type: CommandType
  pattern: string
  example: string
  patterns: CommandPattern[]
  category: CommandCategory
  aliases?: string[]
  tags?: string[]
}

export type CommandCategory =
  | 'File & Directory'
  | 'Text Processing'
  | 'Process Management'
  | 'User & Permissions'
  | 'Networking'
  | 'System Information'
  | 'Disk & Filesystem'
  | 'Archives & Compression'
  | 'Package Management'
  | 'Shell Builtins'
  | 'Development Tools'
  | 'Security'
  | 'Scheduling & Automation'
  | 'Environment & Variables'
  | 'Pipes & Redirection'
  | 'Terminal & Session'
  | 'Search & Find'
  | 'macOS / BSD'
  | 'Linux Specific'
  | 'Containers & Cloud'
  | 'Database CLI'
  | 'Monitoring & Logs'

export interface Scenario {
  id: string
  scenario: string
  codePattern: string
  example: string
  tags: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert'
}

export interface Exercise {
  id: string
  question: string
  hint?: string
  solution: string
  alternateSolutions?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface LessonSection {
  id: string
  title: string
  content: string
  pseudoCode?: string
  example?: string
  output?: string
  keyPoints?: string[]
}

export interface Topic {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  module: string
  sections: LessonSection[]
  exercises: Exercise[]
  estimatedMinutes: number
}

export interface TopicProgress {
  topicId: string
  sectionsCompleted: string[]
  exercisesCompleted: string[]
  studyTimeSeconds: number
  lastVisited: string
  completed: boolean
}

export type PracticeStatus = 'due' | 'done' | 'failed'

export type PracticePlatform =
  | 'overthewire'
  | 'exercism'
  | 'hackerrank'
  | 'leetcode'
  | 'geeksforgeeks'
  | 'codewars'
  | 'cmdchallenge'

export interface ExternalPracticeQuestion {
  id: string
  title: string
  platform: PracticePlatform
  url: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  problemNumber?: string
  tags: string[]
  preview?: string
}

export interface PracticeProgress {
  questionId: string
  status: PracticeStatus
  attempts: number
  practiceTimeSeconds: number
  lastAttempt: string
  solved?: boolean
}

export type BookmarkType = 'topic' | 'fact' | 'command'

export interface Bookmark {
  type: BookmarkType
  id: string
}

export interface ProgressState {
  topics: Record<string, TopicProgress>
  practice: Record<string, PracticeProgress>
  totalStudySeconds: number
  totalPracticeSeconds: number
  studySessions: number
  practiceSessions: number
  studyStreak?: number
  lastStudyDate?: string
  bookmarks?: Bookmark[]
}

export type Theme = 'light' | 'dark'

export interface FactScenario {
  id: string
  title: string
  description: string
  category: string
  level: 'intermediate' | 'advanced' | 'expert'
  tags: string[]
  explanation: string
  mainCode: string
  exampleCode: string
  keyPoints?: string[]
}

export interface FactCategory {
  id: string
  name: string
  description: string
  scenarios: FactScenario[]
}
