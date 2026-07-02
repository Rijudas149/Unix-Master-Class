/** Command type inference and pattern generation for all Unix commands */

import { buildFullExplanation } from './explanations.mjs'

export const COMMAND_TYPES = [
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

const GNU_COREUTILS = new Set([
  'ls', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'touch', 'ln', 'readlink', 'realpath',
  'basename', 'dirname', 'stat', 'file', 'find', 'chmod', 'chown', 'chgrp', 'du', 'df',
  'cat', 'head', 'tail', 'wc', 'sort', 'uniq', 'cut', 'paste', 'join', 'comm', 'tr',
  'tee', 'nl', 'pr', 'fmt', 'fold', 'split', 'csplit', 'shuf', 'seq', 'echo', 'printf',
  'test', 'expr', 'factor', 'date', 'cal', 'sleep', 'timeout', 'yes', 'whoami', 'id',
  'groups', 'users', 'who', 'w', 'uptime', 'uname', 'hostname', 'pwd', 'cd', 'env',
  'printenv', 'nice', 'nohup', 'kill', 'ps', 'top', 'free', 'dd', 'sync', 'mount',
  'umount', 'lsblk', 'mktemp', 'install', 'read', 'sha256sum', 'md5sum', 'base64',
  'od', 'hexdump', 'expand', 'unexpand', 'tac', 'rev', 'shred', 'truncate',
])

const POSIX_UTILITIES = new Set([
  'grep', 'egrep', 'fgrep', 'sed', 'awk', 'gawk', 'vi', 'ed', 'ex', 'more', 'less',
  'man', 'info', 'which', 'whereis', 'type', 'command', 'hash', 'alias', 'unalias',
  'export', 'unset', 'set', 'source', 'eval', 'exec', 'trap', 'shift', 'getopts',
  'jobs', 'bg', 'fg', 'wait', 'disown', 'bind', 'complete', 'compgen', 'history',
  'fc', 'readarray', 'mapfile', 'ulimit', 'umask', 'su', 'sudo', 'passwd', 'login',
  'xargs', 'find', 'locate', 'updatedb', 'diff', 'cmp', 'patch', 'tar', 'gzip',
  'gunzip', 'zcat', 'bzip2', 'bunzip2', 'xz', 'unxz', 'zip', 'unzip', 'curl', 'wget',
  'ping', 'traceroute', 'tracepath', 'netstat', 'ss', 'ip', 'ifconfig', 'route',
  'arp', 'dig', 'nslookup', 'host', 'ssh', 'scp', 'sftp', 'nc', 'telnet', 'ftp',
  'crontab', 'at', 'batch', 'logger', 'dmesg', 'lsof', 'fuser', 'strace', 'ltrace',
  'vmstat', 'iostat', 'mpstat', 'sar', 'last', 'lastlog', 'chroot', 'chattr', 'lsattr',
])

const CLOUD_CLI = new Set([
  'aws', 'gcloud', 'az', 'terraform', 'ansible', 'ansible-playbook', 'packer',
  'vault', 'consul', 'nomad', 'pulumi', 'cdk', 'sam', 'serverless', 'flyctl',
  'doctl', 'linode-cli', 'oci', 'ibmcloud', 'heroku', 'vercel', 'netlify',
])

export function inferType(cmd) {
  const { id, name, category, tags = [] } = cmd

  if (category === 'Shell Builtins') return 'Shell Builtin'
  if (category === 'Pipes & Redirection') return 'Shell Operator'
  if (category === 'Database CLI') return 'Database Client'
  if (category === 'Package Management') return 'Package Manager'
  if (category === 'Archives & Compression') return 'Archive Utility'
  if (category === 'macOS / BSD') return 'BSD / macOS Utility'
  if (category === 'Linux Specific') return 'Linux Specific'
  if (category === 'Monitoring & Logs') return 'Monitoring Utility'
  if (category === 'Security') return 'Security Tool'
  if (category === 'Development Tools') return 'Development Tool'

  if (id.startsWith('kubectl') || name.startsWith('kubectl') || tags.includes('kubernetes')) {
    return id === 'kubectl' || name === 'kubectl' ? 'Kubernetes CLI' : 'Kubernetes CLI'
  }
  if (id.startsWith('docker') || name.startsWith('docker') || tags.includes('docker')) return 'Container CLI'
  if (id.startsWith('podman') || name.startsWith('podman')) return 'Container CLI'
  if (CLOUD_CLI.has(id) || CLOUD_CLI.has(name.split(' ')[0])) return 'Cloud CLI'

  if (category === 'Containers & Cloud') {
    if (/^(helm|k9s|minikube|kind|k3s|kubeadm|kubectx|kubens)/.test(id)) return 'Kubernetes CLI'
    if (/^(docker|podman|buildah|skopeo|crictl|ctr|nerdctl)/.test(id)) return 'Container CLI'
    return 'Cloud CLI'
  }

  if (category === 'Networking') return 'Network Utility'
  if (category === 'Process Management') return 'Process Utility'
  if (category === 'Disk & Filesystem' || category === 'File & Directory') return 'Filesystem Utility'
  if (category === 'System Information') return 'System Utility'
  if (category === 'Text Processing') return 'Filter / Stream Processor'
  if (category === 'Search & Find') return 'Filesystem Utility'
  if (category === 'Environment & Variables') return 'Shell Builtin'
  if (category === 'Terminal & Session') return 'System Utility'
  if (category === 'Scheduling & Automation') return 'System Utility'

  if (GNU_COREUTILS.has(id) || GNU_COREUTILS.has(name)) return 'GNU Coreutils'
  if (POSIX_UTILITIES.has(id) || POSIX_UTILITIES.has(name)) return 'POSIX Utility'

  return 'POSIX Utility'
}

function primary(cmd) {
  return { label: 'Primary usage', pattern: cmd.pattern, example: cmd.example }
}

function helpPattern(cmd) {
  const n = cmd.name.split(' ')[0]
  if (['cd', '|', '>', '>>', '<', '2>&1', '&&', '||', '.', 'source'].includes(n)) return null
  return { label: 'Show help / manual', pattern: `${cmd.name} --help`, example: `${cmd.name} --help` }
}

function manPattern(cmd) {
  const n = cmd.name.split(' ')[0]
  if (['cd', '|', '>', '>>', '<', '2>&1'].includes(n)) return null
  return { label: 'Manual page', pattern: `man ${n}`, example: `man ${n}` }
}

/** Hand-crafted patterns for core commands */
export const MANUAL_PATTERNS = {
  ls: [
    { label: 'Basic listing', pattern: 'ls [path]', example: 'ls /var/log' },
    { label: 'Long format with hidden files', pattern: 'ls -lah [path]', example: 'ls -lah ~' },
    { label: 'Sort by size (largest first)', pattern: 'ls -lhS [path]', example: 'ls -lhS /tmp' },
    { label: 'Sort by modification time', pattern: 'ls -lt [path]', example: 'ls -lt /var/log' },
    { label: 'Recursive listing', pattern: 'ls -R [path]', example: 'ls -R src/' },
    { label: 'One entry per line', pattern: 'ls -1 [path]', example: 'ls -1 /etc | head' },
    { label: 'Show inode numbers', pattern: 'ls -i [path]', example: 'ls -i /etc/passwd' },
    { label: 'Reverse sort order', pattern: 'ls -lr [path]', example: 'ls -lr /tmp' },
  ],
  cd: [
    { label: 'Change to directory', pattern: 'cd [path]', example: 'cd /etc/nginx' },
    { label: 'Go to home directory', pattern: 'cd', example: 'cd' },
    { label: 'Go to previous directory', pattern: 'cd -', example: 'cd -' },
    { label: 'Go up one level', pattern: 'cd ..', example: 'cd ..' },
    { label: 'Go to home with ~', pattern: 'cd ~', example: 'cd ~' },
    { label: 'Change and print path', pattern: 'cd path && pwd', example: 'cd /var/www && pwd' },
  ],
  grep: [
    { label: 'Search in file', pattern: 'grep pattern file', example: "grep 'ERROR' app.log" },
    { label: 'Case-insensitive search', pattern: 'grep -i pattern file', example: "grep -i 'error' app.log" },
    { label: 'Recursive directory search', pattern: 'grep -r pattern dir/', example: "grep -r 'TODO' src/" },
    { label: 'Show line numbers', pattern: 'grep -n pattern file', example: "grep -n 'Exception' app.log" },
    { label: 'Invert match (exclude)', pattern: 'grep -v pattern file', example: "grep -v '^#' config.conf" },
    { label: 'Count matching lines', pattern: 'grep -c pattern file', example: "grep -c 'ERROR' app.log" },
    { label: 'Extended regex (ERE)', pattern: 'grep -E pattern file', example: "grep -E 'error|warn' app.log" },
    { label: 'Recursive with line numbers', pattern: 'grep -RIn pattern dir/', example: "grep -RIn 'password' /etc/" },
    { label: 'Only matching part', pattern: 'grep -o pattern file', example: "grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' access.log" },
    { label: 'Search from stdin pipe', pattern: 'command | grep pattern', example: "ps aux | grep nginx" },
    { label: 'Context lines after match', pattern: 'grep -A N pattern file', example: "grep -A 3 'Exception' app.log" },
    { label: 'Context lines before match', pattern: 'grep -B N pattern file', example: "grep -B 2 'Caused by' app.log" },
    { label: 'Context before and after', pattern: 'grep -C N pattern file', example: "grep -C 5 'FATAL' app.log" },
    { label: 'Fixed string (no regex)', pattern: 'grep -F pattern file', example: "grep -F '.*' config.txt" },
    { label: 'Files with matches only', pattern: 'grep -l pattern dir/', example: "grep -rl 'import React' src/" },
  ],
  find: [
    { label: 'Find by name', pattern: 'find path -name pattern', example: "find /var -name '*.log'" },
    { label: 'Find by type (file/dir)', pattern: 'find path -type f|d', example: 'find . -type f -name "*.ts"' },
    { label: 'Find by modification time', pattern: 'find path -mtime -N', example: 'find /tmp -mtime -1' },
    { label: 'Find by size', pattern: 'find path -size +N', example: 'find / -size +100M 2>/dev/null' },
    { label: 'Execute command on results', pattern: 'find path -exec cmd {} \\;', example: "find . -name '*.bak' -exec rm {} \\;" },
    { label: 'Find with xargs', pattern: 'find path -name pat | xargs cmd', example: "find . -name '*.js' | xargs grep -l 'require'" },
    { label: 'Find empty files', pattern: 'find path -empty', example: 'find /tmp -empty' },
    { label: 'Find by permissions', pattern: 'find path -perm mode', example: 'find / -perm -4000 2>/dev/null' },
    { label: 'Max depth limit', pattern: 'find path -maxdepth N', example: 'find . -maxdepth 2 -name "*.json"' },
    { label: 'Find and delete', pattern: 'find path -name pat -delete', example: "find . -name '.DS_Store' -delete" },
    { label: 'Find by owner', pattern: 'find path -user name', example: 'find /home -user deploy' },
    { label: 'Prune directories', pattern: 'find path -path exclude -prune -o ...', example: "find . -path './node_modules' -prune -o -name '*.ts' -print" },
  ],
  awk: [
    { label: 'Print specific column', pattern: "awk '{print $N}' file", example: "awk '{print $1}' access.log" },
    { label: 'Field separator', pattern: "awk -F':' '{print $N}' file", example: "awk -F':' '{print $1}' /etc/passwd" },
    { label: 'Pattern matching', pattern: "awk '/pattern/ {print}' file", example: "awk '/ERROR/ {print $0}' app.log" },
    { label: 'Sum a column', pattern: "awk '{sum+=$N} END {print sum}'", example: "awk '{sum+=$5} END {print sum}' access.log" },
    { label: 'Conditional print', pattern: "awk '$N > val {print}' file", example: "awk '$3 > 500 {print $1, $3}' metrics.log" },
    { label: 'From stdin pipe', pattern: 'cmd | awk ...', example: "ps aux | awk '$3 > 50 {print $2, $3, $11}'" },
    { label: 'Multiple actions', pattern: "awk 'cond {a++} END {print a}'", example: "awk '/ERROR/ {c++} END {print c}' app.log" },
    { label: 'Output separator', pattern: "awk -v OFS=',' '{print $1,$2}'", example: "awk -v OFS=',' '{print $1,$NF}' data.txt" },
  ],
  sed: [
    { label: 'Substitute first occurrence', pattern: "sed 's/old/new/' file", example: "sed 's/error/warn/' app.log" },
    { label: 'Substitute globally', pattern: "sed 's/old/new/g' file", example: "sed 's/localhost/127.0.0.1/g' config.conf" },
    { label: 'In-place edit', pattern: "sed -i 's/old/new/g' file", example: "sed -i 's/debug/info/g' app.conf" },
    { label: 'Delete matching lines', pattern: "sed '/pattern/d' file", example: "sed '/^#/d' config.conf" },
    { label: 'Print specific lines', pattern: "sed -n 'N,Mp' file", example: "sed -n '10,20p' file.txt" },
    { label: 'Append after match', pattern: "sed '/pattern/a\\text' file", example: "sed '/server_name/a\\    include ssl.conf;' nginx.conf" },
    { label: 'From pipe', pattern: 'cmd | sed ...', example: "cat file | sed 's/foo/bar/g'" },
    { label: 'Multiple expressions', pattern: "sed -e 's/a/b/' -e 's/c/d/' file", example: "sed -e 's/http/https/' -e 's/:80/:443/' config" },
  ],
  chmod: [
    { label: 'Symbolic mode', pattern: 'chmod ugo+rwx file', example: 'chmod u+x script.sh' },
    { label: 'Octal mode', pattern: 'chmod NNN file', example: 'chmod 755 script.sh' },
    { label: 'Recursive', pattern: 'chmod -R mode dir/', example: 'chmod -R 644 public/' },
    { label: 'Add execute for all', pattern: 'chmod +x file', example: 'chmod +x deploy.sh' },
    { label: 'Remove write for group/other', pattern: 'chmod go-w file', example: 'chmod go-w secret.key' },
    { label: 'Reference file mode', pattern: 'chmod --reference=ref target', example: 'chmod --reference=template.conf app.conf' },
  ],
  tar: [
    { label: 'Create gzip archive', pattern: 'tar -czf archive.tar.gz dir/', example: 'tar -czf backup.tar.gz /var/www' },
    { label: 'Extract gzip archive', pattern: 'tar -xzf archive.tar.gz', example: 'tar -xzf backup.tar.gz -C /restore' },
    { label: 'List archive contents', pattern: 'tar -tzf archive.tar.gz', example: 'tar -tzf backup.tar.gz | head' },
    { label: 'Create bzip2 archive', pattern: 'tar -cjf archive.tar.bz2 dir/', example: 'tar -cjf logs.tar.bz2 /var/log' },
    { label: 'Extract to directory', pattern: 'tar -xzf archive -C /path', example: 'tar -xzf release.tar.gz -C /opt/app' },
    { label: 'Exclude patterns', pattern: 'tar --exclude=PATTERN -czf ...', example: "tar --exclude='node_modules' -czf src.tar.gz project/" },
    { label: 'Verbose extract', pattern: 'tar -xzvf archive.tar.gz', example: 'tar -xzvf release.tar.gz' },
    { label: 'Append to archive', pattern: 'tar -rf archive.tar file', example: 'tar -rf backup.tar newfile.conf' },
  ],
  curl: [
    { label: 'GET request', pattern: 'curl URL', example: 'curl https://api.example.com/health' },
    { label: 'Show response headers', pattern: 'curl -I URL', example: 'curl -I https://example.com' },
    { label: 'POST with JSON', pattern: 'curl -X POST -H "Content-Type: application/json" -d JSON URL', example: 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api.example.com/data' },
    { label: 'Download to file', pattern: 'curl -o file URL', example: 'curl -o backup.sql https://cdn.example.com/db.sql' },
    { label: 'Follow redirects', pattern: 'curl -L URL', example: 'curl -L https://bit.ly/example' },
    { label: 'Basic auth', pattern: 'curl -u user:pass URL', example: 'curl -u admin:secret https://api.example.com/admin' },
    { label: 'Custom headers', pattern: 'curl -H "Header: value" URL', example: 'curl -H "Authorization: Bearer TOKEN" https://api.example.com/me' },
    { label: 'Silent with status code', pattern: 'curl -s -o /dev/null -w "%{http_code}" URL', example: 'curl -s -o /dev/null -w "%{http_code}" https://example.com' },
    { label: 'Upload file', pattern: 'curl -F "file=@path" URL', example: 'curl -F "file=@report.pdf" https://api.example.com/upload' },
    { label: 'Resume download', pattern: 'curl -C - -O URL', example: 'curl -C - -O https://releases.example.com/app.tar.gz' },
  ],
  ssh: [
    { label: 'Connect to host', pattern: 'ssh user@host', example: 'ssh deploy@prod-server' },
    { label: 'Run remote command', pattern: 'ssh user@host command', example: 'ssh deploy@prod "systemctl status nginx"' },
    { label: 'Custom port', pattern: 'ssh -p PORT user@host', example: 'ssh -p 2222 admin@bastion' },
    { label: 'Identity file (key)', pattern: 'ssh -i key.pem user@host', example: 'ssh -i ~/.ssh/prod.pem ubuntu@10.0.1.5' },
    { label: 'Local port forward', pattern: 'ssh -L local:host:remote user@host', example: 'ssh -L 5432:db.internal:5432 bastion' },
    { label: 'Remote port forward', pattern: 'ssh -R remote:host:local user@host', example: 'ssh -R 8080:localhost:3000 server' },
    { label: 'Jump host (ProxyJump)', pattern: 'ssh -J jump user@target', example: 'ssh -J bastion deploy@app-server' },
    { label: 'Disable strict host key check', pattern: 'ssh -o StrictHostKeyChecking=no user@host', example: 'ssh -o StrictHostKeyChecking=no user@new-host' },
    { label: 'X11 forwarding', pattern: 'ssh -X user@host', example: 'ssh -X user@desktop' },
  ],
  docker: [
    { label: 'List running containers', pattern: 'docker ps', example: "docker ps --format 'table {{.Names}}\\t{{.Status}}'" },
    { label: 'List all containers', pattern: 'docker ps -a', example: 'docker ps -a --filter status=exited' },
    { label: 'Run container detached', pattern: 'docker run -d --name N -p H:C image', example: 'docker run -d --name api -p 8080:8080 api:2.3' },
    { label: 'Interactive shell in container', pattern: 'docker exec -it container sh', example: "docker exec -it api sh -lc 'curl localhost:8080/health'" },
    { label: 'View container logs', pattern: 'docker logs [-f] container', example: 'docker logs -f --tail 100 api' },
    { label: 'Build image from Dockerfile', pattern: 'docker build -t name:tag .', example: 'docker build -t myapp:1.0 .' },
    { label: 'Remove unused resources', pattern: 'docker system prune -a', example: 'docker system prune -af --volumes' },
    { label: 'Inspect container JSON', pattern: 'docker inspect container', example: "docker inspect api --format '{{.NetworkSettings.IPAddress}}'" },
  ],
  kubectl: [
    { label: 'Get all pods', pattern: 'kubectl get pods -A', example: 'kubectl get pods -A -o wide' },
    { label: 'Describe resource', pattern: 'kubectl describe TYPE NAME', example: 'kubectl describe pod api-7x9k2 -n prod' },
    { label: 'Apply manifest', pattern: 'kubectl apply -f file.yaml', example: 'kubectl apply -f deployment.yaml -n prod' },
    { label: 'View pod logs', pattern: 'kubectl logs pod [-f]', example: 'kubectl logs -f api-7x9k2 -n prod --tail=100' },
    { label: 'Exec into pod', pattern: 'kubectl exec -it pod -- cmd', example: 'kubectl exec -it api-7x9k2 -n prod -- sh' },
    { label: 'Port forward', pattern: 'kubectl port-forward pod local:remote', example: 'kubectl port-forward svc/api 8080:80 -n prod' },
    { label: 'Scale deployment', pattern: 'kubectl scale deploy/NAME --replicas=N', example: 'kubectl scale deploy/api --replicas=5 -n prod' },
    { label: 'Rollout status', pattern: 'kubectl rollout status deploy/NAME', example: 'kubectl rollout status deploy/api -n prod' },
    { label: 'JSONPath output', pattern: "kubectl get pods -o jsonpath='{...}'", example: "kubectl get pods -n prod -o jsonpath='{range .items[*]}{.metadata.name}{\"\\n\"}{end}'" },
    { label: 'Delete resource', pattern: 'kubectl delete -f file.yaml', example: 'kubectl delete pod api-7x9k2 -n prod --grace-period=0' },
  ],
  xargs: [
    { label: 'Run command per input line', pattern: 'cmd | xargs command', example: "find . -name '*.log' | xargs rm" },
    { label: 'Parallel execution', pattern: 'cmd | xargs -P N command', example: "cat urls.txt | xargs -P 8 -I{} curl -s {}" },
    { label: 'Replace placeholder', pattern: 'cmd | xargs -I{} command {}', example: "ls *.txt | xargs -I{} mv {} {}.bak" },
    { label: 'Null-delimited (safe for spaces)', pattern: 'cmd -print0 | xargs -0 command', example: "find . -name '*.log' -print0 | xargs -0 rm" },
    { label: 'Limit args per command', pattern: 'cmd | xargs -n N command', example: 'echo 1 2 3 4 5 | xargs -n 2 echo' },
    { label: 'Dry run (print only)', pattern: 'cmd | xargs -t command', example: "find . -name '*.tmp' | xargs -t rm" },
  ],
  ps: [
    { label: 'All processes', pattern: 'ps aux', example: 'ps aux' },
    { label: 'Process tree', pattern: 'ps auxf', example: 'ps auxf' },
    { label: 'Filter by user', pattern: 'ps -u user', example: 'ps -u nginx' },
    { label: 'Custom output format', pattern: 'ps -eo pid,user,cmd', example: 'ps -eo pid,user,%cpu,cmd --sort=-%cpu | head' },
    { label: 'Find PID by name', pattern: 'pgrep name', example: 'pgrep -a nginx' },
    { label: 'Thread view', pattern: 'ps -eLf', example: 'ps -eLf | grep java' },
  ],
  kill: [
    { label: 'Terminate by PID', pattern: 'kill PID', example: 'kill 12345' },
    { label: 'Force kill (SIGKILL)', pattern: 'kill -9 PID', example: 'kill -9 12345' },
    { label: 'Graceful stop (SIGTERM)', pattern: 'kill -15 PID', example: 'kill -15 12345' },
    { label: 'Reload config (SIGHUP)', pattern: 'kill -HUP PID', example: 'kill -HUP $(cat /var/run/nginx.pid)' },
    { label: 'Kill by name', pattern: 'pkill name', example: 'pkill -f "node server.js"' },
    { label: 'Kill all matching', pattern: 'killall name', example: 'killall -9 chrome' },
  ],
}

/** Docker subcommand-specific patterns */
const DOCKER_SUB_PATTERNS = {
  'docker-ps': [
    { label: 'Running containers only', pattern: 'docker ps', example: "docker ps --format 'table {{.Names}}\\t{{.Status}}'" },
    { label: 'All containers including stopped', pattern: 'docker ps -a', example: 'docker ps -a --filter status=exited' },
    { label: 'Filter by name', pattern: 'docker ps --filter name=NAME', example: 'docker ps --filter name=api' },
    { label: 'Show container IDs only', pattern: 'docker ps -q', example: 'docker ps -aq' },
    { label: 'Last created container', pattern: 'docker ps -l', example: 'docker ps -l' },
  ],
  'docker-run': [
    { label: 'Detached with port mapping', pattern: 'docker run -d -p HOST:CONTAINER image', example: 'docker run -d --name api -p 8080:8080 api:2.3' },
    { label: 'Interactive terminal', pattern: 'docker run -it image sh', example: 'docker run -it --rm ubuntu:22.04 bash' },
    { label: 'With environment variables', pattern: 'docker run -e KEY=VAL image', example: 'docker run -e NODE_ENV=production -d api:latest' },
    { label: 'Mount volume', pattern: 'docker run -v host:container image', example: 'docker run -v /data:/app/data -d app' },
    { label: 'Remove after exit', pattern: 'docker run --rm image cmd', example: 'docker run --rm node:18 node -v' },
    { label: 'With memory limit', pattern: 'docker run -m LIMIT image', example: 'docker run -m 512m -d api:latest' },
    { label: 'Network mode', pattern: 'docker run --network NET image', example: 'docker run --network host -d api' },
  ],
  'docker-exec': [
    { label: 'Interactive shell', pattern: 'docker exec -it container sh', example: 'docker exec -it api sh' },
    { label: 'Run single command', pattern: 'docker exec container cmd', example: "docker exec api curl -s localhost:8080/health" },
    { label: 'As specific user', pattern: 'docker exec -u user container cmd', example: 'docker exec -u root api apt-get update' },
    { label: 'Set working directory', pattern: 'docker exec -w /path container cmd', example: 'docker exec -w /app api ls -la' },
  ],
  'docker-logs': [
    { label: 'Tail last N lines', pattern: 'docker logs --tail N container', example: 'docker logs --tail 100 api' },
    { label: 'Follow log stream', pattern: 'docker logs -f container', example: 'docker logs -f api' },
    { label: 'Since timestamp', pattern: 'docker logs --since TIME container', example: 'docker logs --since 30m api' },
    { label: 'With timestamps', pattern: 'docker logs -t container', example: 'docker logs -t --tail 50 api' },
  ],
  'docker-build': [
    { label: 'Tag image', pattern: 'docker build -t name:tag .', example: 'docker build -t myapp:1.0 .' },
    { label: 'No cache build', pattern: 'docker build --no-cache -t name .', example: 'docker build --no-cache -t myapp:latest .' },
    { label: 'Build arg', pattern: 'docker build --build-arg KEY=VAL -t name .', example: 'docker build --build-arg VERSION=2.0 -t app .' },
    { label: 'Specific Dockerfile', pattern: 'docker build -f Dockerfile.prod -t name .', example: 'docker build -f Dockerfile.prod -t app:prod .' },
  ],
}

/** Kubectl subcommand patterns */
const KUBECTL_SUB_PATTERNS = {
  'kubectl-get': [
    { label: 'All namespaces wide output', pattern: 'kubectl get pods -A -o wide', example: 'kubectl get pods -A -o wide' },
    { label: 'Specific namespace', pattern: 'kubectl get TYPE -n NS', example: 'kubectl get deploy -n prod' },
    { label: 'YAML output', pattern: 'kubectl get TYPE NAME -o yaml', example: 'kubectl get deploy api -n prod -o yaml' },
    { label: 'JSON output', pattern: 'kubectl get TYPE NAME -o json', example: 'kubectl get pod api-7x9k2 -n prod -o json' },
    { label: 'Watch mode', pattern: 'kubectl get pods -w', example: 'kubectl get pods -n prod -w' },
    { label: 'Label selector', pattern: 'kubectl get pods -l key=val', example: 'kubectl get pods -n prod -l app=api' },
  ],
  'kubectl-logs': [
    { label: 'Follow logs', pattern: 'kubectl logs -f POD -n NS', example: 'kubectl logs -f api-7x9k2 -n prod' },
    { label: 'Previous container', pattern: 'kubectl logs POD --previous', example: 'kubectl logs api-7x9k2 -n prod --previous' },
    { label: 'All containers in pod', pattern: 'kubectl logs POD --all-containers', example: 'kubectl logs api-7x9k2 -n prod --all-containers' },
    { label: 'Tail lines', pattern: 'kubectl logs --tail=N POD', example: 'kubectl logs --tail=200 api-7x9k2 -n prod' },
    { label: 'Since time', pattern: 'kubectl logs --since=TIME POD', example: 'kubectl logs --since=1h api-7x9k2 -n prod' },
  ],
  'kubectl-apply': [
    { label: 'Apply manifest file', pattern: 'kubectl apply -f file.yaml', example: 'kubectl apply -f deployment.yaml -n prod' },
    { label: 'Apply directory', pattern: 'kubectl apply -f dir/', example: 'kubectl apply -f k8s/ -n prod' },
    { label: 'Dry run server', pattern: 'kubectl apply -f file --dry-run=server', example: 'kubectl apply -f deploy.yaml --dry-run=server -n prod' },
    { label: 'Force replace', pattern: 'kubectl apply -f file --force', example: 'kubectl apply -f crd.yaml --force' },
  ],
  'kubectl-delete': [
    { label: 'Delete by file', pattern: 'kubectl delete -f file.yaml', example: 'kubectl delete -f job.yaml -n prod' },
    { label: 'Delete by name', pattern: 'kubectl delete TYPE NAME', example: 'kubectl delete pod api-7x9k2 -n prod' },
    { label: 'Force immediate', pattern: 'kubectl delete pod NAME --grace-period=0 --force', example: 'kubectl delete pod stuck-pod -n prod --grace-period=0 --force' },
    { label: 'Delete by label', pattern: 'kubectl delete pods -l key=val', example: 'kubectl delete pods -n prod -l job=backup' },
  ],
}

function categoryPatterns(cmd) {
  const n = cmd.name
  const patterns = []

  switch (cmd.category) {
    case 'Text Processing':
      patterns.push(
        { label: 'Process file directly', pattern: `${n} [options] file`, example: cmd.example },
        { label: 'Read from stdin pipe', pattern: `command | ${n.split(' ')[0]} [options]`, example: `cat file.txt | ${n.split(' ')[0]}` },
        { label: 'Multiple input files', pattern: `${n} [options] file1 file2`, example: `${n.split(' ')[0]} file1.txt file2.txt` },
        { label: 'Output to file', pattern: `${n.split(' ')[0]} ... > outfile`, example: `${n.split(' ')[0]} input.txt > output.txt` },
      )
      break
    case 'Networking':
      patterns.push(
        { label: 'Basic usage', pattern: cmd.pattern, example: cmd.example },
        { label: 'Verbose output', pattern: `${n} -v ...`, example: `${n.split(' ')[0]} -v ${cmd.example.split(' ').slice(1).join(' ') || 'target'}` },
        { label: 'With timeout', pattern: `${n.split(' ')[0]} -w SECONDS ...`, example: `${n.split(' ')[0]} -w 5 target` },
      )
      break
    case 'Process Management':
      patterns.push(
        { label: 'Standard usage', pattern: cmd.pattern, example: cmd.example },
        { label: 'Combined with pipe', pattern: `${n.split(' ')[0]} ... | grep pattern`, example: `ps aux | grep ${n.split(' ')[0]}` },
        { label: 'Output to file', pattern: `${n.split(' ')[0]} ... > outfile`, example: `${n.split(' ')[0]} > processes.txt` },
      )
      break
    case 'File & Directory':
      patterns.push(
        { label: 'Single target', pattern: `${n.split(' ')[0]} target`, example: cmd.example },
        { label: 'Multiple targets', pattern: `${n.split(' ')[0]} target1 target2`, example: `${n.split(' ')[0]} file1 file2` },
        { label: 'Recursive operation', pattern: `${n.split(' ')[0]} -R ...`, example: `${n.split(' ')[0]} -R directory/` },
        { label: 'Force without prompt', pattern: `${n.split(' ')[0]} -f ...`, example: `${n.split(' ')[0]} -f target` },
        { label: 'Interactive confirmation', pattern: `${n.split(' ')[0]} -i ...`, example: `${n.split(' ')[0]} -i target` },
      )
      break
    case 'Archives & Compression':
      patterns.push(
        { label: 'Compress', pattern: cmd.pattern, example: cmd.example },
        { label: 'Decompress', pattern: `${n.split(' ')[0]} -d file`, example: `${n.split(' ')[0]} -d archive.gz` },
        { label: 'List contents', pattern: `${n.split(' ')[0]} -l archive`, example: `${n.split(' ')[0]} -l archive.tar.gz` },
        { label: 'Test integrity', pattern: `${n.split(' ')[0]} -t archive`, example: `${n.split(' ')[0]} -t archive.tar.gz` },
      )
      break
    case 'User & Permissions':
      patterns.push(
        { label: 'Standard usage', pattern: cmd.pattern, example: cmd.example },
        { label: 'Recursive on directory', pattern: `${n.split(' ')[0]} -R ...`, example: `${n.split(' ')[0]} -R /path` },
        { label: 'Verbose output', pattern: `${n.split(' ')[0]} -v ...`, example: `${n.split(' ')[0]} -v target` },
      )
      break
    case 'Security':
      patterns.push(
        { label: 'Standard usage', pattern: cmd.pattern, example: cmd.example },
        { label: 'Audit / list mode', pattern: `${n.split(' ')[0]} --list ...`, example: `${n.split(' ')[0]} --list` },
        { label: 'Dry run / test', pattern: `${n.split(' ')[0]} --dry-run ...`, example: `${n.split(' ')[0]} --dry-run` },
      )
      break
    case 'Package Management':
      patterns.push(
        { label: 'Install package', pattern: `${n.split(' ')[0]} install PACKAGE`, example: cmd.example },
        { label: 'Remove package', pattern: `${n.split(' ')[0]} remove PACKAGE`, example: `${n.split(' ')[0]} remove package-name` },
        { label: 'Search packages', pattern: `${n.split(' ')[0]} search KEYWORD`, example: `${n.split(' ')[0]} search nginx` },
        { label: 'Update index/cache', pattern: `${n.split(' ')[0]} update`, example: `${n.split(' ')[0]} update` },
        { label: 'Upgrade all packages', pattern: `${n.split(' ')[0]} upgrade`, example: `${n.split(' ')[0]} upgrade` },
      )
      break
    case 'Development Tools':
      patterns.push(
        { label: 'Standard invocation', pattern: cmd.pattern, example: cmd.example },
        { label: 'With verbose flag', pattern: `${n.split(' ')[0]} -v ...`, example: `${n.split(' ')[0]} -v` },
        { label: 'Help / usage', pattern: `${n.split(' ')[0]} --help`, example: `${n.split(' ')[0]} --help` },
        { label: 'Version info', pattern: `${n.split(' ')[0]} --version`, example: `${n.split(' ')[0]} --version` },
      )
      break
    case 'Database CLI':
      patterns.push(
        { label: 'Connect to database', pattern: cmd.pattern, example: cmd.example },
        { label: 'Execute query inline', pattern: `${n.split(' ')[0]} -e "SQL"`, example: `${n.split(' ')[0]} -e "SELECT 1"` },
        { label: 'Execute SQL file', pattern: `${n.split(' ')[0]} < script.sql`, example: `${n.split(' ')[0]} dbname < backup.sql` },
        { label: 'Batch mode (no headers)', pattern: `${n.split(' ')[0]} -N -e "SQL"`, example: `${n.split(' ')[0]} -N -e "SELECT id FROM users"` },
      )
      break
    case 'Monitoring & Logs':
      patterns.push(
        { label: 'Standard monitoring', pattern: cmd.pattern, example: cmd.example },
        { label: 'Continuous watch', pattern: `${n.split(' ')[0]} -w SEC ...`, example: `${n.split(' ')[0]} -w 2` },
        { label: 'Filter by time range', pattern: `${n.split(' ')[0]} --since TIME ...`, example: `${n.split(' ')[0]} --since "1 hour ago"` },
        { label: 'Follow / tail mode', pattern: `${n.split(' ')[0]} -f ...`, example: `${n.split(' ')[0]} -f` },
      )
      break
    case 'Shell Builtins':
      patterns.push(
        { label: 'Basic usage', pattern: cmd.pattern, example: cmd.example },
        { label: 'In script context', pattern: `${n.split(' ')[0]} ...  # in .sh file`, example: cmd.example },
        { label: 'Combined with other builtins', pattern: `${n.split(' ')[0]} ... && ...`, example: `${cmd.example} && echo done` },
      )
      break
    case 'Pipes & Redirection':
      patterns.push(
        { label: 'Basic redirection', pattern: cmd.pattern, example: cmd.example },
        { label: 'Combined stdout+stderr', pattern: 'command 2>&1 | other', example: 'command 2>&1 | tee log.txt' },
        { label: 'Append instead of overwrite', pattern: 'command >> file', example: 'echo "log entry" >> app.log' },
        { label: 'Here document', pattern: 'command << EOF ... EOF', example: 'cat << EOF\nline1\nEOF' },
      )
      break
    default:
      break
  }

  return patterns
}

function tagPatterns(cmd) {
  const patterns = []
  const base = cmd.name.split(' ')[0]
  const tags = cmd.tags ?? []

  if (tags.includes('search')) {
    patterns.push(
      { label: 'Case-insensitive', pattern: `${base} -i pattern file`, example: `${base} -i 'pattern' file.txt` },
      { label: 'Recursive search', pattern: `${base} -r pattern dir/`, example: `${base} -r 'pattern' ./` },
    )
  }
  if (tags.includes('delete')) {
    patterns.push(
      { label: 'Force delete', pattern: `${base} -f target`, example: `${base} -f target` },
      { label: 'Interactive delete', pattern: `${base} -i target`, example: `${base} -i target` },
    )
  }
  if (tags.includes('copy') || tags.includes('create')) {
    patterns.push(
      { label: 'Preserve attributes', pattern: `${base} -a src dst`, example: `${base} -a source dest` },
      { label: 'Recursive', pattern: `${base} -r src dst`, example: `${base} -r src/ dest/` },
    )
  }
  if (tags.includes('docker') && !cmd.id.startsWith('docker-')) {
    patterns.push(
      { label: 'JSON format output', pattern: `${cmd.name} --format json`, example: `${cmd.example.split(' ').slice(0, 2).join(' ')} --format json` },
    )
  }
  if (tags.includes('kubernetes') && !cmd.id.startsWith('kubectl-')) {
    patterns.push(
      { label: 'Namespace flag', pattern: `${cmd.name} -n NAMESPACE`, example: `${cmd.example} -n prod` },
      { label: 'All namespaces', pattern: `${cmd.name} -A`, example: `${cmd.name.split(' ')[0]} get pods -A` },
    )
  }

  return patterns
}

function dedupePatterns(patterns) {
  const seen = new Set()
  return patterns.filter((p) => {
    const key = `${p.label}|${p.pattern}|${p.example}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function generatePatterns(cmd) {
  const id = cmd.id
  const baseName = cmd.name.split(' ')[0]

  // Manual override by id or base name
  if (MANUAL_PATTERNS[id]) return MANUAL_PATTERNS[id]
  if (MANUAL_PATTERNS[baseName]) return MANUAL_PATTERNS[baseName]

  // Docker subcommands
  if (DOCKER_SUB_PATTERNS[id]) {
    return dedupePatterns([primary(cmd), ...DOCKER_SUB_PATTERNS[id]])
  }

  // Kubectl subcommands
  if (KUBECTL_SUB_PATTERNS[id]) {
    return dedupePatterns([primary(cmd), ...KUBECTL_SUB_PATTERNS[id]])
  }

  // Generic docker-* subcommands
  if (id.startsWith('docker-') && !DOCKER_SUB_PATTERNS[id]) {
    const sub = id.replace('docker-', '')
    return dedupePatterns([
      primary(cmd),
      { label: `${sub} with format`, pattern: `docker ${sub} --format '{{.Names}}'`, example: `docker ${sub} --format '{{.Names}}'` },
      { label: `${sub} quiet IDs only`, pattern: `docker ${sub} -q`, example: `docker ${sub} -q` },
      { label: `${sub} with filter`, pattern: `docker ${sub} --filter key=val`, example: `docker ${sub} --filter status=running` },
    ])
  }

  // Generic kubectl-* subcommands
  if (id.startsWith('kubectl-') && !KUBECTL_SUB_PATTERNS[id]) {
    const sub = id.replace('kubectl-', '').replace(/-/g, ' ')
    return dedupePatterns([
      primary(cmd),
      { label: `${sub} with namespace`, pattern: `kubectl ${sub} -n NAMESPACE`, example: `kubectl ${sub} -n prod` },
      { label: `${sub} with output format`, pattern: `kubectl ${sub} -o yaml`, example: `kubectl ${sub} -o yaml` },
      { label: `${sub} dry run`, pattern: `kubectl ${sub} --dry-run=client`, example: `kubectl ${sub} --dry-run=client -o yaml` },
    ])
  }

  // Build from category + tags + generic
  const patterns = [
    primary(cmd),
    ...categoryPatterns(cmd),
    ...tagPatterns(cmd),
  ]

  const help = helpPattern(cmd)
  const man = manPattern(cmd)
  if (help) patterns.push(help)
  if (man) patterns.push(man)

  // Flag variants from pattern string
  const flagMatch = cmd.pattern.match(/\[(-[^\]]+)\]/)
  if (flagMatch) {
    patterns.push({
      label: 'With common flags',
      pattern: cmd.pattern.replace('[options]', flagMatch[1]).replace(/\[[^\]]+\]/g, flagMatch[1]),
      example: cmd.example,
    })
  }

  // Pipe-friendly for filters
  if (['Filter / Stream Processor', 'Text Processing'].includes(cmd.category) ||
      inferType(cmd) === 'Filter / Stream Processor') {
    patterns.push({
      label: 'In pipeline',
      pattern: `cmd1 | ${baseName} [options] | cmd2`,
      example: `cat file | ${baseName} | head -20`,
    })
  }

  // find | xargs combo
  if (baseName === 'find') {
    patterns.push({
      label: 'With -print0 and xargs',
      pattern: "find . -name 'pat' -print0 | xargs -0 cmd",
      example: "find . -name '*.log' -print0 | xargs -0 rm",
    })
  }

  return dedupePatterns(patterns.filter(Boolean))
}

export function enrichCommand(cmd) {
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
}
