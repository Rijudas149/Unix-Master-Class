import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..')
const scenariosPath = path.join(rootDir, 'src', 'data', 'scenarios.json')

const SOURCES = [
  { cmd: 'cat', file: '/var/log/nginx/access.log', label: 'nginx access log', tags: ['logs', 'nginx'] },
  { cmd: 'cat', file: 'app.log', label: 'application log', tags: ['logs', 'app'] },
  { cmd: 'cat', file: '/var/log/syslog', label: 'system log', tags: ['logs', 'system'] },
  { cmd: 'cat', file: 'access.log', label: 'web access log', tags: ['logs', 'web'] },
  { cmd: 'cat', file: 'error.log', label: 'error log', tags: ['logs', 'errors'] },
  { cmd: 'ps aux', file: '', label: 'running processes', tags: ['process'] },
  { cmd: 'docker ps', file: '', label: 'Docker containers', tags: ['docker'] },
  { cmd: 'kubectl get pods -A', file: '', label: 'Kubernetes pods', tags: ['kubernetes'] },
  { cmd: 'find .', file: '', label: 'files under current directory', tags: ['files'] },
  { cmd: 'history', file: '', label: 'shell command history', tags: ['shell'] },
  { cmd: 'df -h', file: '', label: 'disk usage report', tags: ['disk'] },
  { cmd: 'netstat -tlnp', file: '', label: 'network socket list', tags: ['network'] },
  { cmd: 'ss -tlnp', file: '', label: 'open listening sockets', tags: ['network'] },
  { cmd: 'git log --oneline', file: '', label: 'git commit history', tags: ['git'] },
  { cmd: 'curl -s https://api.example.com/data', file: '', label: 'API response', tags: ['api'] },
]

const FILTERS = [
  { name: 'grep', pattern: "grep 'ERROR'", title: 'Find ERROR lines in', diff: 'basic' },
  { name: 'grep -i', pattern: "grep -i 'warn'", title: 'Case-insensitive search in', diff: 'basic' },
  { name: 'grep -v', pattern: "grep -v '^#'", title: 'Exclude comment lines from', diff: 'basic' },
  { name: 'grep -c', pattern: "grep -c 'FAIL'", title: 'Count matching lines in', diff: 'basic' },
  { name: 'grep -E', pattern: "grep -E 'error|warn'", title: 'Match multiple patterns in', diff: 'intermediate' },
  { name: 'awk', pattern: "awk '{print $1}'", title: 'Extract first column from', diff: 'intermediate' },
  { name: 'awk filter', pattern: "awk '$5 > 500 {print $1, $5}'", title: 'Filter rows by value in', diff: 'advanced' },
  { name: 'sed', pattern: "sed 's/localhost/127.0.0.1/g'", title: 'Replace text in output of', diff: 'intermediate' },
  { name: 'cut', pattern: "cut -d':' -f1", title: 'Extract a field from', diff: 'basic' },
  { name: 'sort', pattern: 'sort', title: 'Sort output from', diff: 'basic' },
  { name: 'sort -n', pattern: 'sort -n', title: 'Sort numerically, output from', diff: 'basic' },
  { name: 'uniq', pattern: 'uniq -c', title: 'Count unique lines in', diff: 'basic' },
  { name: 'wc -l', pattern: 'wc -l', title: 'Count lines in', diff: 'basic' },
  { name: 'head', pattern: 'head -20', title: 'Show first 20 lines of', diff: 'basic' },
  { name: 'tail', pattern: 'tail -50', title: 'Show last 50 lines of', diff: 'basic' },
  { name: 'less', pattern: 'less', title: 'Page through output of', diff: 'basic' },
  { name: 'tee', pattern: 'tee /tmp/output.log', title: 'Save and display output of', diff: 'intermediate' },
  { name: 'xargs', pattern: 'xargs -I{} rm -v {}', title: 'Pass output of', diff: 'intermediate' },
  { name: 'tr', pattern: "tr -d '\\r'", title: 'Transform characters in', diff: 'intermediate' },
  { name: 'column', pattern: 'column -t', title: 'Format columns in', diff: 'intermediate' },
]

const TRIPLE_CHAINS = [
  { mid: "grep '404'", end: 'wc -l', scenario: 'Count HTTP 404 responses in access log', codePattern: "cat access.log | grep '404' | wc -l", diff: 'intermediate' },
  { mid: "grep 'ERROR'", end: 'tail -20', scenario: 'Show last 20 error lines from application log', codePattern: "cat app.log | grep 'ERROR' | tail -20", diff: 'basic' },
  { mid: 'grep nginx', end: "awk '{print $2}'", scenario: 'Extract PIDs of nginx worker processes', codePattern: "ps aux | grep nginx | awk '{print $2}'", diff: 'intermediate' },
  { mid: 'sort', end: 'uniq -c', scenario: 'Count duplicate lines in command output', codePattern: 'command | sort | uniq -c', diff: 'basic' },
  { mid: 'sort', end: 'uniq -c | sort -nr | head', scenario: 'Find most frequent log entries', codePattern: 'cat log | sort | uniq -c | sort -nr | head', diff: 'intermediate' },
  { mid: "awk '{print $1}'", end: 'sort | uniq -c', scenario: 'Count occurrences of first column values', codePattern: "cat data | awk '{print $1}' | sort | uniq -c", diff: 'intermediate' },
  { mid: "grep -v '^$'", end: 'wc -l', scenario: 'Count non-empty lines in output', codePattern: "cat file | grep -v '^$' | wc -l", diff: 'basic' },
  { mid: 'grep Running', end: 'wc -l', scenario: 'Count running Docker containers', codePattern: 'docker ps | grep Running | wc -l', diff: 'basic' },
  { mid: 'grep CrashLoop', end: "awk '{print $1}'", scenario: 'List pods in CrashLoopBackOff state', codePattern: "kubectl get pods -A | grep CrashLoop | awk '{print $1}'", diff: 'advanced' },
  { mid: "grep -E 'error|warn'", end: 'tee issues.log', scenario: 'Filter and save warnings while viewing live', codePattern: "tail -f app.log | grep -E 'error|warn' | tee issues.log", diff: 'intermediate' },
  { mid: 'sort -k2 -n', end: 'head -10', scenario: 'Show top 10 entries by numeric second column', codePattern: 'cat data.tsv | sort -k2 -n | head -10', diff: 'advanced' },
  { mid: "sed 's/,/\\t/g'", end: 'column -t', scenario: 'Format CSV-like output as aligned columns', codePattern: "cat data.csv | sed 's/,/\\t/g' | column -t", diff: 'advanced' },
  { mid: 'grep LISTEN', end: "awk '{print $4}'", scenario: 'List listening ports from socket output', codePattern: "ss -tlnp | grep LISTEN | awk '{print $4}'", diff: 'intermediate' },
  { mid: "grep -v '0.0.0.0'", end: 'head', scenario: 'Filter out localhost bindings from port list', codePattern: "netstat -tlnp | grep -v '0.0.0.0' | head", diff: 'intermediate' },
  { mid: 'grep fix', end: 'head -5', scenario: 'Show recent fix commits from git log', codePattern: 'git log --oneline | grep fix | head -5', diff: 'basic' },
]

const REDIRECT_SCENARIOS = [
  { scenario: 'Save directory listing to a text file', codePattern: 'ls -la > listing.txt', example: 'ls -la > listing.txt', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Append timestamp to a cron log', codePattern: 'echo "msg" >> /var/log/cron.log', example: 'echo "$(date): job ran" >> /var/log/cron.log', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Capture build output and errors in one log', codePattern: 'npm run build > build.log 2>&1', example: 'npm run build > build.log 2>&1', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Silence all output from a noisy command', codePattern: 'find / -name "*.tmp" 2>/dev/null > /dev/null', example: 'find / -name "*.tmp" 2>/dev/null > /dev/null', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Send errors to separate file while keeping stdout', codePattern: 'node migrate.js 2> migration-errors.log', example: 'node migrate.js 2> migration-errors.log', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Feed SQL script to database from file', codePattern: 'mysql -u root dbname < schema.sql', example: 'mysql -u root dbname < schema.sql', tags: ['redirect', 'pipes', 'database'], difficulty: 'intermediate' },
  { scenario: 'Count lines in a file via stdin redirect', codePattern: 'wc -l < access.log', example: 'wc -l < access.log', tags: ['redirect', 'pipes'], difficulty: 'basic' },
  { scenario: 'Pipe build output through tee to log and screen', codePattern: 'make 2>&1 | tee make.log', example: 'make 2>&1 | tee make.log', tags: ['pipe', 'tee', 'pipes'], difficulty: 'intermediate' },
  { scenario: 'Use pipefail in script so pipeline errors are caught', codePattern: 'set -euo pipefail', example: 'set -euo pipefail', tags: ['pipe', 'scripting', 'pipes'], difficulty: 'advanced' },
  { scenario: 'Diff sorted output of two files without temp files', codePattern: 'diff <(sort old.txt) <(sort new.txt)', example: 'diff <(sort old.txt) <(sort new.txt)', tags: ['pipe', 'advanced', 'pipes'], difficulty: 'advanced' },
]

const SPECIFIC = [
  { scenario: 'List running Java processes', codePattern: "ps aux | grep java | grep -v grep", example: "ps aux | grep java | grep -v grep", difficulty: 'basic' },
  { scenario: 'Find largest files in current directory', codePattern: 'du -ah . | sort -rh | head -20', example: "du -ah . | sort -rh | head -20", difficulty: 'intermediate' },
  { scenario: 'Extract unique IP addresses from access log', codePattern: "awk '{print $1}' access.log | sort | uniq -c | sort -nr | head", example: "awk '{print $1}' access.log | sort | uniq -c | sort -nr | head", difficulty: 'intermediate' },
  { scenario: 'Monitor error rate in live log stream', codePattern: "tail -f app.log | grep --line-buffered 'ERROR'", example: "tail -f app.log | grep --line-buffered 'ERROR'", difficulty: 'advanced' },
  { scenario: 'Delete all .pyc files found by find', codePattern: "find . -name '*.pyc' | xargs rm -f", example: "find . -name '*.pyc' | xargs rm -f", difficulty: 'intermediate' },
  { scenario: 'Gzip all log files in directory', codePattern: 'ls *.log | xargs gzip', example: "ls *.log | xargs gzip", difficulty: 'intermediate' },
  { scenario: 'Check which npm packages are outdated', codePattern: 'npm outdated | cat', example: 'npm outdated | cat', difficulty: 'basic' },
  { scenario: 'Filter docker images by repository name', codePattern: 'docker images | grep myapp', example: "docker images | grep myapp", difficulty: 'basic' },
  { scenario: 'Get pod names only from kubectl output', codePattern: "kubectl get pods -n prod | awk 'NR>1 {print $1}'", example: "kubectl get pods -n prod | awk 'NR>1 {print $1}'", difficulty: 'intermediate' },
  { scenario: 'Count lines of code in Python files', codePattern: "find . -name '*.py' | xargs wc -l | tail -1", example: "find . -name '*.py' | xargs wc -l | tail -1", difficulty: 'intermediate' },
  { scenario: 'Show disk usage of top 10 directories', codePattern: 'du -h /var | sort -rh | head -10', example: 'du -h /var | sort -rh | head -10', difficulty: 'intermediate' },
  { scenario: 'Find failed SSH login attempts', codePattern: "grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr", example: "grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr", difficulty: 'advanced' },
  { scenario: 'Parse JSON API response with jq', codePattern: "curl -s https://api.github.com/users/octocat | jq '.login'", example: "curl -s https://api.github.com/users/octocat | jq '.login'", difficulty: 'intermediate' },
  { scenario: 'Filter journalctl output by service unit', codePattern: 'journalctl -u nginx | grep error', example: "journalctl -u nginx | grep error", difficulty: 'intermediate' },
  { scenario: 'List open files for a process', codePattern: 'lsof -p 1234 | grep REG', example: 'lsof -p 1234 | grep REG', difficulty: 'advanced' },
  { scenario: 'Show environment variables sorted', codePattern: 'env | sort', example: 'env | sort', difficulty: 'basic' },
  { scenario: 'Find world-writable files', codePattern: 'find / -perm -002 2>/dev/null | head', example: "find / -perm -002 2>/dev/null | head", difficulty: 'advanced' },
  { scenario: 'Extract HTTP status codes from log', codePattern: "awk '{print $9}' access.log | sort | uniq -c | sort -nr", example: "awk '{print $9}' access.log | sort | uniq -c | sort -nr", difficulty: 'intermediate' },
  { scenario: 'Pipe curl through grep to check health endpoint', codePattern: "curl -s localhost:8080/health | grep ok", example: "curl -s localhost:8080/health | grep ok", difficulty: 'basic' },
  { scenario: 'Rename batch of files with sed and xargs', codePattern: "ls *.txt | sed 's/.txt$//' | xargs -I{} mv {}.txt {}.bak", example: "ls *.txt | sed 's/.txt$//' | xargs -I{} mv {}.txt {}.bak", difficulty: 'advanced' },
  { scenario: 'Show unique usernames from passwd file', codePattern: 'cut -d: -f1 /etc/passwd | sort | uniq', example: "cut -d: -f1 /etc/passwd | sort | uniq", difficulty: 'basic' },
  { scenario: 'Filter apt search results', codePattern: "apt search nginx | grep '^nginx/'", example: "apt search nginx | grep '^nginx/'", difficulty: 'basic' },
  { scenario: 'Count docker containers by status', codePattern: "docker ps -a | awk 'NR>1 {print $NF}' | sort | uniq -c", example: "docker ps -a | awk 'NR>1 {print $NF}' | sort | uniq -c", difficulty: 'intermediate' },
  { scenario: 'Pipe terraform plan to grep for changes', codePattern: "terraform plan -no-color 2>&1 | grep '#'", example: "terraform plan -no-color 2>&1 | grep '#'", difficulty: 'advanced' },
  { scenario: 'Extract certificate expiry from openssl', codePattern: 'echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -enddate', example: "echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -enddate", difficulty: 'advanced' },
  { scenario: 'Show listening ports owned by node process', codePattern: 'ss -tlnp | grep node', example: "ss -tlnp | grep node", difficulty: 'intermediate' },
  { scenario: 'Filter git branches containing feature name', codePattern: 'git branch -a | grep feature/login', example: "git branch -a | grep feature/login", difficulty: 'basic' },
  { scenario: 'Count TODO comments in codebase', codePattern: "grep -r 'TODO' src/ | wc -l", example: "grep -r 'TODO' src/ | wc -l", difficulty: 'basic' },
  { scenario: 'Show last 10 ansible playbook tasks', codePattern: 'ansible-playbook site.yml -v | tail -20', example: 'ansible-playbook site.yml -v | tail -20', difficulty: 'intermediate' },
  { scenario: 'Pipe mysql query output through column', codePattern: "mysql -e 'SHOW DATABASES' | column -t", example: "mysql -e 'SHOW DATABASES' | column -t", difficulty: 'intermediate' },
  { scenario: 'Filter dmesg for USB device events', codePattern: 'dmesg | grep -i usb | tail -20', example: "dmesg | grep -i usb | tail -20", difficulty: 'basic' },
  { scenario: 'List systemd failed units', codePattern: 'systemctl list-units --failed | grep failed', example: "systemctl list-units --failed | grep failed", difficulty: 'intermediate' },
  { scenario: 'Show redis slow log entries', codePattern: 'redis-cli slowlog get 10 | head', example: 'redis-cli slowlog get 10 | head', difficulty: 'advanced' },
  { scenario: 'Extract S3 bucket names from aws cli', codePattern: "aws s3 ls | awk '{print $3}'", example: "aws s3 ls | awk '{print $3}'", difficulty: 'intermediate' },
  { scenario: 'Pipe helm list through grep for release', codePattern: 'helm list -A | grep my-release', example: "helm list -A | grep my-release", difficulty: 'intermediate' },
  { scenario: 'Count nginx worker connections', codePattern: 'ss -ant | grep :80 | wc -l', example: "ss -ant | grep :80 | wc -l", difficulty: 'intermediate' },
  { scenario: 'Show unique MIME types in log', codePattern: "awk '{print $12}' access.log | sort | uniq -c | sort -nr", example: "awk '{print $12}' access.log | sort | uniq -c | sort -nr", difficulty: 'advanced' },
]

function sourceBase(src) {
  return src.file ? `${src.cmd} ${src.file}` : src.cmd
}

function buildTitle(src, filter) {
  if (filter.name === 'xargs') {
    return `${filter.title} ${src.label} to another command`
  }
  return `${filter.title} ${src.label}`
}

function buildCodePattern(src, filter) {
  const base = sourceBase(src)
  return `${base} | ${filter.pattern}`
}

function buildScenarios() {
  const out = []
  let id = 0

  for (const src of SOURCES) {
    for (const f of FILTERS) {
      if (out.length >= 120) break
      const example = buildCodePattern(src, f)
      out.push({
        id: `scenario-pipe-${String(++id).padStart(4, '0')}`,
        scenario: buildTitle(src, f),
        codePattern: example,
        example,
        tags: ['pipes', ...src.tags, f.name.split(' ')[0]],
        difficulty: f.diff,
      })
    }
  }

  for (const t of TRIPLE_CHAINS) {
    const src = SOURCES[out.length % SOURCES.length]
    const base = sourceBase(src)
    out.push({
      id: `scenario-pipe-${String(++id).padStart(4, '0')}`,
      scenario: t.scenario,
      codePattern: t.codePattern,
      example: `${base} | ${t.mid} | ${t.end}`,
      tags: ['pipes', 'chain', ...src.tags],
      difficulty: t.diff,
    })
  }

  for (const r of REDIRECT_SCENARIOS) {
    out.push({
      id: `scenario-pipe-${String(++id).padStart(4, '0')}`,
      ...r,
    })
  }

  for (const s of SPECIFIC) {
    out.push({
      id: `scenario-pipe-${String(++id).padStart(4, '0')}`,
      scenario: s.scenario,
      codePattern: s.codePattern,
      example: s.example,
      tags: ['pipes'],
      difficulty: s.difficulty,
    })
  }

  const seen = new Set()
  return out.filter((s) => {
    if (seen.has(s.example)) return false
    seen.add(s.example)
    return true
  })
}

const pipeScenarios = buildScenarios()
const existing = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'))
const nonPipe = existing.filter((s) => !s.id.startsWith('scenario-pipe-'))
const merged = [...pipeScenarios, ...nonPipe]

fs.writeFileSync(scenariosPath, JSON.stringify(merged, null, 2))
console.log(`Added ${pipeScenarios.length} pipe scenarios. Total: ${merged.length}`)
