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

export const COMMAND_TYPES: CommandType[] = [
  'Shell Builtin',
  'Shell Operator',
  'POSIX Utility',
  'GNU Coreutils',
  'Filter / Stream Processor',
  'Network Utility',
  'Process Utility',
  'Filesystem Utility',
  'System Utility',
  'Linux Specific',
  'BSD / macOS Utility',
  'Security Tool',
  'Archive Utility',
  'Package Manager',
  'Development Tool',
  'Container CLI',
  'Kubernetes CLI',
  'Cloud CLI',
  'Database Client',
  'Monitoring Utility',
  'Text Utility',
]

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

export type AppSection = 'home' | 'commands' | 'facts' | 'learn'

export const COMMAND_CATEGORIES: CommandCategory[] = [
  'File & Directory',
  'Text Processing',
  'Process Management',
  'User & Permissions',
  'Networking',
  'System Information',
  'Disk & Filesystem',
  'Archives & Compression',
  'Package Management',
  'Shell Builtins',
  'Development Tools',
  'Security',
  'Scheduling & Automation',
  'Environment & Variables',
  'Pipes & Redirection',
  'Terminal & Session',
  'Search & Find',
  'macOS / BSD',
  'Linux Specific',
  'Containers & Cloud',
  'Database CLI',
  'Monitoring & Logs',
]
