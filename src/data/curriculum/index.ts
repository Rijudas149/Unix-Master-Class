import { commands } from '../index'
import type { Topic, Exercise, LessonSection, UnixCommand } from '../../types'

export const MODULE_DEFINITIONS = [
  {
    id: 'navigation',
    name: 'Navigation & Files',
    intro: 'Move around the filesystem and manage files.',
    commands: ['pwd', 'cd', 'ls', 'mkdir', 'cp', 'mv', 'rm', 'find', 'tree'],
  },
  {
    id: 'text',
    name: 'Reading & Searching Text',
    intro: 'View files and search for patterns.',
    commands: ['cat', 'less', 'head', 'tail', 'grep', 'sed', 'awk', 'cut', 'sort', 'uniq'],
  },
  {
    id: 'processes',
    name: 'Processes',
    intro: 'Monitor and control running programs.',
    commands: ['ps', 'top', 'htop', 'kill', 'nohup', 'jobs', 'bg', 'fg', 'nice', 'renice'],
  },
  {
    id: 'permissions',
    name: 'Permissions & Users',
    intro: 'Manage access and ownership.',
    commands: ['chmod', 'chown', 'chgrp', 'umask', 'sudo', 'su', 'id', 'whoami', 'groups'],
  },
  {
    id: 'networking',
    name: 'Networking',
    intro: 'Connect and transfer data remotely.',
    commands: ['ping', 'curl', 'wget', 'ssh', 'scp', 'netstat', 'ss', 'dig', 'nc', 'traceroute'],
  },
  {
    id: 'pipes',
    name: 'Pipes & Redirection',
    intro: 'Chain commands with | and control stdin/stdout/stderr.',
    commands: ['|', '>', '>>', '<', '2>&1', '&>', 'tee', 'xargs', '2>', 'set -o pipefail'],
  },
  {
    id: 'archives',
    name: 'Archives',
    intro: 'Compress and package files.',
    commands: ['tar', 'gzip', 'gunzip', 'zip', 'unzip', 'bzip2', 'xz'],
  },
  {
    id: 'system',
    name: 'System Info',
    intro: 'Inspect hardware, disk, and OS.',
    commands: ['uname', 'df', 'du', 'free', 'uptime', 'dmesg', 'lscpu', 'lsblk', 'mount'],
  },
]

function inferLevel(moduleIdx: number): Topic['level'] {
  if (moduleIdx <= 1) return 'beginner'
  if (moduleIdx <= 4) return 'intermediate'
  if (moduleIdx <= 6) return 'advanced'
  return 'expert'
}

const SAMPLE_OUTPUTS: Record<string, string> = {
  pwd: '/home/user/projects\n',
  ls: 'Documents  Downloads  projects  README.md\n',
  whoami: 'user\n',
  'uname -a': 'Linux workstation 6.5.0 x86_64 GNU/Linux\n',
  df: 'Filesystem     Size  Used Avail Use% Mounted on\n/dev/sda1       50G   20G   28G  42% /\n',
  free: '              total        used        free\nMem:       16384000     8192000     8192000\n',
  uptime: ' 14:32:01 up 3 days,  5:12,  2 users,  load average: 0.15, 0.10, 0.05\n',
  grep: 'ERROR: connection refused\nERROR: timeout after 30s\n',
  ps: '  PID TTY          TIME CMD\n 1234 pts/0    00:00:01 bash\n 5678 pts/0    00:00:00 ps\n',
  ping: '64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=12.3 ms\n',
}

function commandToTopic(cmd: UnixCommand, moduleName: string, moduleIdx: number): Topic {
  const desc = cmd.explanation.split('. ').slice(0, 2).join('. ') + '.'
  const patternsContent = cmd.patterns
    .map((p) => `- **${p.label}:** \`${p.pattern}\` → \`${p.example}\``)
    .join('\n')

  const sections: LessonSection[] = [
    {
      id: 'understand',
      title: 'Understanding',
      content: cmd.explanation,
      example: cmd.example,
      output: SAMPLE_OUTPUTS[cmd.name] ?? SAMPLE_OUTPUTS[cmd.example],
      keyPoints: [
        `Type: **${cmd.type}** — category: **${cmd.category}**`,
        `Basic pattern: \`${cmd.pattern}\``,
        `Example: \`${cmd.example}\``,
        ...(cmd.tags?.slice(0, 2).map((t) => `Common use: ${t}`) ?? []),
      ],
    },
    {
      id: 'syntax',
      title: 'Syntax & Structure',
      content: `The **${cmd.name}** command follows this general pattern:

\`${cmd.pattern}\`

**Command:** \`${cmd.name}\`
**Type:** ${cmd.type}
**Category:** ${cmd.category}

Replace placeholders like \`[path]\`, \`[file]\`, or \`[options]\` with your actual values. Run \`man ${cmd.name}\` on any Linux/macOS system for the full manual page.`,
      pseudoCode: `${cmd.name.toUpperCase()} command structure

  Pattern: ${cmd.pattern}
  Example: ${cmd.example}

WHEN you run: ${cmd.example}
THEN the shell executes ${cmd.name} with the given arguments
     and prints results to stdout (or stderr on error).`,
      example: cmd.example,
    },
    {
      id: 'patterns',
      title: 'Common Patterns',
      content: `Here are the most useful **${cmd.name}** patterns you'll use in daily work:

${patternsContent}

Copy any example and run it in your terminal. Modify paths and flags to match your environment.`,
      example: cmd.patterns[1]?.example ?? cmd.example,
    },
  ]

  const exercises: Exercise[] = cmd.patterns.slice(0, 3).map((p, i) => ({
    id: `${cmd.id}-ex-${i + 1}`,
    question: `${p.label}: Write the ${cmd.name} command for this task.`,
    hint: `Use the pattern: ${p.pattern}. Example context: ${p.example}`,
    solution: p.example,
    alternateSolutions: [],
    difficulty: (i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard') as Exercise['difficulty'],
  }))

  if (exercises.length === 0) {
    exercises.push({
      id: `${cmd.id}-ex-1`,
      question: `Write a basic ${cmd.name} command using the standard pattern.`,
      hint: `Pattern: ${cmd.pattern}`,
      solution: cmd.example,
      difficulty: 'easy',
    })
  }

  return {
    id: cmd.id,
    title: cmd.name,
    description: desc,
    level: inferLevel(moduleIdx),
    module: moduleName,
    sections,
    exercises,
    estimatedMinutes: 10 + Math.min(cmd.patterns.length, 6),
  }
}

function buildCurriculum() {
  const allTopics: Topic[] = []
  const modules = MODULE_DEFINITIONS.map((mod, idx) => {
    const topics = mod.commands
      .map((name) => commands.find((c) => c.name === name))
      .filter((c): c is UnixCommand => !!c)
      .map((c) => commandToTopic(c, mod.name, idx))
    allTopics.push(...topics)
    return { id: mod.id, name: mod.name, topics }
  })
  return { modules, allTopics }
}

const { modules, allTopics } = buildCurriculum()

export { modules, allTopics }

export function getTopicById(id: string) {
  return allTopics.find((t) => t.id === id)
}

export function getModuleForTopic(topicId: string) {
  return modules.find((m) => m.topics.some((t) => t.id === topicId))
}
