import fs from 'fs'
import path from 'path'
import { inferType, generatePatterns } from './lib/enrichment.mjs'

const rootDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..')
const commandsPath = path.join(rootDir, 'src', 'data', 'commands.json')

const PIPE_COMMANDS = [
  {
    id: 'pipe',
    name: '|',
    explanation: 'The pipe operator sends the standard output (stdout) of the command on its left as standard input (stdin) to the command on its right, letting you chain tools into powerful one-liners without creating temporary files.',
    pattern: 'command1 | command2',
    example: "cat /var/log/app.log | grep 'ERROR' | wc -l",
    category: 'Pipes & Redirection',
    tags: ['pipe', 'stdout', 'chaining'],
  },
  {
    id: 'pipe-stderr',
    name: '|&',
    explanation: 'Pipe both stdout and stderr from the left command into the right command — Bash shorthand for 2>&1 |. Useful when error messages must flow through the same filter as normal output.',
    pattern: 'command1 |& command2',
    example: 'make 2>&1 | tee build.log',
    category: 'Pipes & Redirection',
    tags: ['pipe', 'stderr'],
  },
  {
    id: 'redirect-out',
    name: '>',
    explanation: 'Redirect stdout to a file, overwriting the file if it already exists. This is how you save command output, generate config files, and capture logs from scripts.',
    pattern: 'command > file',
    example: 'ls -la > directory-listing.txt',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stdout'],
  },
  {
    id: 'redirect-append',
    name: '>>',
    explanation: 'Redirect stdout to a file by appending to the end without overwriting existing content — the standard way to add lines to log files over time.',
    pattern: 'command >> file',
    example: 'echo "$(date): backup started" >> /var/log/backup.log',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stdout', 'append'],
  },
  {
    id: 'redirect-in',
    name: '<',
    explanation: "Redirect a file into a command's stdin so the command reads from that file instead of the keyboard. Often used with mail, databases, and filters.",
    pattern: 'command < file',
    example: 'wc -l < access.log',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stdin'],
  },
  {
    id: 'redirect-stderr',
    name: '2>',
    explanation: 'Redirect stderr (file descriptor 2) to a file, separating error messages from normal stdout. Essential for clean logs when commands emit warnings to stderr.',
    pattern: 'command 2> error.log',
    example: 'node app.js 2> errors.log',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stderr'],
  },
  {
    id: 'redirect-merge',
    name: '2>&1',
    explanation: 'Merge stderr into stdout so both streams go to the same destination — required before piping both streams together or capturing everything in one log file.',
    pattern: 'command > file 2>&1',
    example: './deploy.sh > deploy.log 2>&1',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stderr', 'stdout'],
  },
  {
    id: 'redirect-stdout-stderr',
    name: '&>',
    explanation: 'Redirect both stdout and stderr to the same file in Bash, equivalent to > file 2>&1. A concise way to capture all output from a command.',
    pattern: 'command &> file',
    example: 'npm run build &> build-output.log',
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stderr', 'stdout'],
  },
  {
    id: 'here-doc',
    name: '<<',
    explanation: "Here document — feed multiple lines of text to a command's stdin until a delimiter line is reached. Common in scripts for SQL, config generation, and interactive tools.",
    pattern: 'command << DELIMITER',
    example: "cat << 'EOF' > config.txt\nserver_name localhost;\nEOF",
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stdin', 'heredoc'],
  },
  {
    id: 'here-string',
    name: '<<<',
    explanation: 'Here string — pass a single string as stdin to a command. Handy for quick one-line input without creating a file.',
    pattern: 'command <<< "string"',
    example: "grep 'error' <<< \"$logline\"",
    category: 'Pipes & Redirection',
    tags: ['redirect', 'stdin'],
  },
  {
    id: 'process-substitution',
    name: '<()',
    explanation: "Process substitution treats a command's output as a temporary file path, letting you compare or diff output of two commands without saving to disk.",
    pattern: 'diff <(cmd1) <(cmd2)',
    example: 'diff <(sort file1.txt) <(sort file2.txt)',
    category: 'Pipes & Redirection',
    tags: ['pipe', 'advanced'],
  },
  {
    id: 'set-pipefail',
    name: 'set -o pipefail',
    explanation: 'Bash option that makes a pipeline return the exit status of the rightmost failing command, not just the last one. Critical for reliable CI/CD and deployment scripts.',
    pattern: 'set -o pipefail',
    example: 'set -euo pipefail',
    category: 'Pipes & Redirection',
    tags: ['pipe', 'shell', 'scripting'],
  },
  {
    id: 'named-pipe',
    name: 'mkfifo',
    explanation: 'Create a named pipe (FIFO) — a special file that connects two processes so one writes and the other reads in real time without storing data on disk.',
    pattern: 'mkfifo /path/pipe',
    example: 'mkfifo /tmp/stream && producer > /tmp/stream & consumer < /tmp/stream',
    category: 'Pipes & Redirection',
    tags: ['pipe', 'ipc'],
  },
]

const MANUAL_PIPE_PATTERNS = {
  pipe: [
    { label: 'Basic two-command pipe', pattern: 'cmd1 | cmd2', example: "ls -la | grep '.conf'" },
    { label: 'Three-command chain', pattern: 'cmd1 | cmd2 | cmd3', example: "cat access.log | grep '404' | wc -l" },
    { label: 'Pipe to grep', pattern: 'cmd | grep pattern', example: "ps aux | grep nginx" },
    { label: 'Pipe to sort', pattern: 'cmd | sort', example: 'cat names.txt | sort' },
    { label: 'Pipe to head or tail', pattern: 'cmd | head -n N', example: 'history | tail -20' },
    { label: 'Pipe to awk', pattern: "cmd | awk '{...}'", example: "df -h | awk 'NR>1 {print $5, $6}'" },
    { label: 'Pipe to sed', pattern: "cmd | sed 's/old/new/g'", example: "cat config | sed 's/old/new/g'" },
    { label: 'Pipe to cut', pattern: "cmd | cut -d: -f1", example: "cat /etc/passwd | cut -d: -f1" },
    { label: 'Sort then count unique', pattern: 'cmd | sort | uniq -c', example: 'sort access.log | uniq -c | sort -nr' },
    { label: 'Pipe to wc', pattern: 'cmd | wc -l', example: "grep -r 'TODO' src/ | wc -l" },
    { label: 'Pipe to less', pattern: 'cmd | less', example: 'git log --oneline | less' },
    { label: 'Long pipeline', pattern: 'cmd1 | cmd2 | ... | cmdN', example: "cat log | grep ERROR | awk '{print $1}' | sort | uniq -c | sort -nr | head" },
  ],
  'pipe-stderr': [
    { label: 'Pipe stdout and stderr', pattern: 'cmd |& filter', example: 'make 2>&1 | tee build.log' },
    { label: 'Equivalent with 2>&1', pattern: 'cmd 2>&1 | filter', example: 'npm test 2>&1 | tee test.log' },
  ],
  'redirect-out': [
    { label: 'Save output to file', pattern: 'command > file', example: 'ls -la > listing.txt' },
    { label: 'Discard stdout', pattern: 'command > /dev/null', example: 'npm install > /dev/null' },
  ],
  'redirect-append': [
    { label: 'Append line to log', pattern: 'command >> file', example: 'echo "$(date): done" >> app.log' },
    { label: 'Append command output', pattern: 'command >> file', example: 'df -h >> disk-report.log' },
  ],
  'redirect-in': [
    { label: 'Read file as stdin', pattern: 'command < file', example: 'wc -l < access.log' },
    { label: 'Feed SQL script', pattern: 'mysql < script.sql', example: 'mysql -u root db < schema.sql' },
  ],
  'redirect-stderr': [
    { label: 'Save errors only', pattern: 'command 2> errors.log', example: 'node app.js 2> errors.log' },
    { label: 'Hide stderr', pattern: 'command 2> /dev/null', example: 'find / -name foo 2> /dev/null' },
  ],
  'redirect-merge': [
    { label: 'Capture stdout and stderr', pattern: 'command > file 2>&1', example: './deploy.sh > deploy.log 2>&1' },
    { label: 'Pipe merged streams', pattern: 'command 2>&1 | filter', example: 'make 2>&1 | tee build.log' },
  ],
  'redirect-stdout-stderr': [
    { label: 'Redirect all output', pattern: 'command &> file', example: 'npm run build &> build.log' },
    { label: 'Discard all output', pattern: 'command &> /dev/null', example: 'ping -c 3 host &> /dev/null' },
  ],
  'here-doc': [
    { label: 'Write multi-line file', pattern: "cat << 'EOF' > file", example: "cat << 'EOF' > config.txt\nkey=value\nEOF" },
    { label: 'Feed heredoc to command', pattern: 'command << EOF', example: "mysql -u root << EOF\nSHOW DATABASES;\nEOF" },
  ],
  'here-string': [
    { label: 'Search inline string', pattern: "grep 'pat' <<< \"\$var\"", example: "grep 'error' <<< \"$logline\"" },
    { label: 'Pass string to filter', pattern: 'command <<< "text"', example: 'wc -w <<< "hello world"' },
  ],
  'process-substitution': [
    { label: 'Compare sorted files', pattern: 'diff <(sort f1) <(sort f2)', example: 'diff <(sort old.txt) <(sort new.txt)' },
    { label: 'Use as file argument', pattern: 'command <(cmd)', example: 'vimdiff <(cmd1) <(cmd2)' },
  ],
  'set-pipefail': [
    { label: 'Enable pipefail', pattern: 'set -o pipefail', example: 'set -euo pipefail' },
    { label: 'Strict pipeline script', pattern: 'set -euo pipefail', example: 'set -euo pipefail' },
  ],
  'named-pipe': [
    { label: 'Create named pipe', pattern: 'mkfifo /path/pipe', example: 'mkfifo /tmp/stream' },
    { label: 'Producer and consumer', pattern: 'mkfifo pipe && producer > pipe & consumer < pipe', example: 'mkfifo /tmp/stream && writer > /tmp/stream & reader < /tmp/stream' },
  ],
}

function enrichPipe(raw) {
  const type = inferType(raw)
  const patterns = MANUAL_PIPE_PATTERNS[raw.id] ?? generatePatterns(raw)
  return {
    ...raw,
    type,
    explanation: raw.explanation,
    patterns,
    pattern: patterns[0]?.pattern ?? raw.pattern,
    example: patterns[0]?.example ?? raw.example,
  }
}

const commands = JSON.parse(fs.readFileSync(commandsPath, 'utf8'))
const pipeIds = new Set(PIPE_COMMANDS.map((c) => c.id))
const withoutOld = commands.filter((c) => !pipeIds.has(c.id))
const enriched = PIPE_COMMANDS.map(enrichPipe)
const final = [...withoutOld, ...enriched]

fs.writeFileSync(commandsPath, JSON.stringify(final, null, 2))
console.log(`Pipe commands: ${enriched.length}. Total commands: ${final.length}`)
