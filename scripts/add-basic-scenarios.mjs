import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..')
const scenariosPath = path.join(rootDir, 'src', 'data', 'scenarios.json')

/** Template groups — each expands into multiple basic scenarios */
const TEMPLATES = [
  // Navigation
  { scenario: 'Check your current working directory', codePattern: 'pwd', example: 'pwd', tags: ['navigation', 'basics'] },
  { scenario: 'Print the physical path without symlinks', codePattern: 'pwd -P', example: 'pwd -P', tags: ['navigation', 'basics'] },
  { scenario: 'List all files including hidden ones', codePattern: 'ls -la', example: 'ls -la', tags: ['files', 'basics'] },
  { scenario: 'List files with human-readable sizes', codePattern: 'ls -lh', example: 'ls -lh /var/log', tags: ['files', 'basics'] },
  { scenario: 'List only directories', codePattern: 'ls -d */', example: 'ls -d */', tags: ['files', 'basics'] },
  { scenario: 'List files sorted by modification time', codePattern: 'ls -lt', example: 'ls -lt', tags: ['files', 'basics'] },
  { scenario: 'List files one per line', codePattern: 'ls -1', example: 'ls -1 | wc -l', tags: ['files', 'basics'] },
  { scenario: 'Go to your home directory', codePattern: 'cd ~', example: 'cd ~', tags: ['navigation', 'basics'] },
  { scenario: 'Go up one directory level', codePattern: 'cd ..', example: 'cd ..', tags: ['navigation', 'basics'] },
  { scenario: 'Go to the root of the filesystem', codePattern: 'cd /', example: 'cd /', tags: ['navigation', 'basics'] },
  { scenario: 'Return to the previous directory', codePattern: 'cd -', example: 'cd -', tags: ['navigation', 'basics'] },
  { scenario: 'Change into a specific project folder', codePattern: 'cd path', example: 'cd ~/projects/my-app', tags: ['navigation', 'basics'] },

  // Files — create, copy, move, delete
  { scenario: 'Create a single new directory', codePattern: 'mkdir name', example: 'mkdir backups', tags: ['files', 'basics'] },
  { scenario: 'Create a nested directory tree', codePattern: 'mkdir -p', example: 'mkdir -p src/utils/helpers', tags: ['files', 'basics'] },
  { scenario: 'Create an empty file', codePattern: 'touch file', example: 'touch notes.txt', tags: ['files', 'basics'] },
  { scenario: 'Create multiple files at once', codePattern: 'touch f1 f2', example: 'touch file1.txt file2.txt', tags: ['files', 'basics'] },
  { scenario: 'Copy a file to another folder', codePattern: 'cp src dst', example: 'cp report.pdf ~/Documents/', tags: ['files', 'basics'] },
  { scenario: 'Copy a file preserving permissions', codePattern: 'cp -p', example: 'cp -p original.conf backup.conf', tags: ['files', 'basics'] },
  { scenario: 'Copy a directory recursively', codePattern: 'cp -r', example: 'cp -r project/ project-backup/', tags: ['files', 'basics'] },
  { scenario: 'Rename a file', codePattern: 'mv old new', example: 'mv draft.txt final.txt', tags: ['files', 'basics'] },
  { scenario: 'Move a file into another directory', codePattern: 'mv file dir/', example: 'mv image.png ~/Pictures/', tags: ['files', 'basics'] },
  { scenario: 'Delete a file', codePattern: 'rm file', example: 'rm temp.log', tags: ['files', 'basics'] },
  { scenario: 'Delete an empty directory', codePattern: 'rmdir dir', example: 'rmdir empty-folder', tags: ['files', 'basics'] },
  { scenario: 'Remove a directory and all its contents', codePattern: 'rm -rf dir', example: 'rm -rf old-cache/', tags: ['files', 'basics'] },
  { scenario: 'Create a symbolic link to a file', codePattern: 'ln -s target link', example: 'ln -s /var/log/nginx nginx-logs', tags: ['files', 'basics'] },
  { scenario: 'Show where a symbolic link points', codePattern: 'readlink -f', example: 'readlink -f /usr/bin/python', tags: ['files', 'basics'] },

  // Viewing text
  { scenario: 'Display entire contents of a small file', codePattern: 'cat file', example: 'cat /etc/hostname', tags: ['text', 'basics'] },
  { scenario: 'Show file with line numbers', codePattern: 'cat -n', example: 'cat -n script.sh', tags: ['text', 'basics'] },
  { scenario: 'View a long file interactively', codePattern: 'less file', example: 'less /var/log/syslog', tags: ['text', 'basics'] },
  { scenario: 'Show first 10 lines of a file', codePattern: 'head file', example: 'head access.log', tags: ['text', 'basics'] },
  { scenario: 'Show first N lines of a file', codePattern: 'head -n N', example: 'head -n 25 config.yml', tags: ['text', 'basics'] },
  { scenario: 'Show last 10 lines of a file', codePattern: 'tail file', example: 'tail error.log', tags: ['text', 'basics'] },
  { scenario: 'Show last N lines of a file', codePattern: 'tail -n N', example: 'tail -n 100 app.log', tags: ['text', 'basics'] },
  { scenario: 'Watch a log file update live', codePattern: 'tail -f', example: 'tail -f /var/log/nginx/access.log', tags: ['logs', 'basics'] },
  { scenario: 'Count total lines in a file', codePattern: 'wc -l', example: 'wc -l data.csv', tags: ['text', 'basics'] },
  { scenario: 'Count words in a file', codePattern: 'wc -w', example: 'wc -w essay.txt', tags: ['text', 'basics'] },
  { scenario: 'Show line, word, and byte counts', codePattern: 'wc file', example: 'wc report.txt', tags: ['text', 'basics'] },

  // Search
  { scenario: 'Find a word in a single file', codePattern: 'grep pattern file', example: "grep 'error' app.log", tags: ['search', 'basics'] },
  { scenario: 'Case-insensitive search in a file', codePattern: 'grep -i', example: "grep -i 'warning' app.log", tags: ['search', 'basics'] },
  { scenario: 'Search recursively in a folder', codePattern: 'grep -r', example: "grep -r 'function' src/", tags: ['search', 'basics'] },
  { scenario: 'Show line numbers with search results', codePattern: 'grep -n', example: "grep -n 'ERROR' app.log", tags: ['search', 'basics'] },
  { scenario: 'Invert search to show non-matching lines', codePattern: 'grep -v', example: "grep -v '^#' config.conf", tags: ['search', 'basics'] },
  { scenario: 'Count how many lines match a pattern', codePattern: 'grep -c', example: "grep -c 'FAIL' test-results.log", tags: ['search', 'basics'] },
  { scenario: 'Find files by name in current directory', codePattern: "find . -name", example: "find . -name '*.js'", tags: ['search', 'basics'] },
  { scenario: 'Find only files (not directories)', codePattern: 'find -type f', example: "find . -type f -name '*.py'", tags: ['search', 'basics'] },
  { scenario: 'Find only directories', codePattern: 'find -type d', example: "find . -type d -name 'node_modules'", tags: ['search', 'basics'] },
  { scenario: 'Find files modified in the last 24 hours', codePattern: 'find -mtime -1', example: 'find /tmp -mtime -1', tags: ['search', 'basics'] },
  { scenario: 'Locate a command on the system', codePattern: 'which cmd', example: 'which node', tags: ['help', 'basics'] },
  { scenario: 'Find all locations of a command', codePattern: 'whereis cmd', example: 'whereis python3', tags: ['help', 'basics'] },

  // Sort & transform text
  { scenario: 'Sort lines alphabetically', codePattern: 'sort file', example: 'sort names.txt', tags: ['text', 'basics'] },
  { scenario: 'Sort numbers numerically', codePattern: 'sort -n', example: 'sort -n numbers.txt', tags: ['text', 'basics'] },
  { scenario: 'Sort in reverse order', codePattern: 'sort -r', example: 'sort -r scores.txt', tags: ['text', 'basics'] },
  { scenario: 'Remove duplicate adjacent lines', codePattern: 'uniq', example: 'sort items.txt | uniq', tags: ['text', 'basics'] },
  { scenario: 'Count unique lines', codePattern: 'sort | uniq -c', example: 'sort access.log | uniq -c', tags: ['text', 'basics'] },
  { scenario: 'Extract a specific column from text', codePattern: "cut -d' ' -fN", example: "cut -d' ' -f1 access.log", tags: ['text', 'basics'] },
  { scenario: 'Replace characters in a stream', codePattern: 'tr old new', example: "tr 'a-z' 'A-Z' < file.txt", tags: ['text', 'basics'] },
  { scenario: 'Delete blank lines from a file', codePattern: "grep -v '^$'", example: "grep -v '^$' messy.txt", tags: ['text', 'basics'] },

  // Pipes & redirection
  { scenario: 'Save command output to a file', codePattern: 'cmd > file', example: 'ls -la > listing.txt', tags: ['pipes', 'basics'] },
  { scenario: 'Append output to end of a file', codePattern: 'cmd >> file', example: 'echo "done" >> log.txt', tags: ['pipes', 'basics'] },
  { scenario: 'Pipe output to another command', codePattern: 'cmd1 | cmd2', example: "cat file.txt | grep 'error'", tags: ['pipes', 'basics'] },
  { scenario: 'Use a file as command input', codePattern: 'cmd < file', example: 'wc -l < data.txt', tags: ['pipes', 'basics'] },
  { scenario: 'Send errors to a separate file', codePattern: 'cmd 2> errors', example: 'node app.js 2> errors.log', tags: ['pipes', 'basics'] },
  { scenario: 'Combine stdout and stderr into one file', codePattern: 'cmd > file 2>&1', example: './build.sh > build.log 2>&1', tags: ['pipes', 'basics'] },
  { scenario: 'Save output and still see it on screen', codePattern: 'cmd | tee file', example: 'npm test 2>&1 | tee test-output.log', tags: ['pipes', 'basics'] },
  { scenario: 'Chain multiple filters together', codePattern: 'cmd | cmd | cmd', example: "cat access.log | grep '404' | wc -l", tags: ['pipes', 'basics'] },

  // System info
  { scenario: 'See your username', codePattern: 'whoami', example: 'whoami', tags: ['system', 'basics'] },
  { scenario: 'Show user ID and group memberships', codePattern: 'id', example: 'id', tags: ['system', 'basics'] },
  { scenario: 'Display system uptime', codePattern: 'uptime', example: 'uptime', tags: ['system', 'basics'] },
  { scenario: 'Show kernel and OS information', codePattern: 'uname -a', example: 'uname -a', tags: ['system', 'basics'] },
  { scenario: 'Show only the OS name', codePattern: 'uname -s', example: 'uname -s', tags: ['system', 'basics'] },
  { scenario: 'Display hostname of the machine', codePattern: 'hostname', example: 'hostname', tags: ['system', 'basics'] },
  { scenario: 'Show current date and time', codePattern: 'date', example: 'date', tags: ['system', 'basics'] },
  { scenario: 'Display formatted date', codePattern: 'date +format', example: "date '+%Y-%m-%d %H:%M:%S'", tags: ['system', 'basics'] },
  { scenario: 'Check memory usage', codePattern: 'free -h', example: 'free -h', tags: ['system', 'basics'] },
  { scenario: 'Show disk space usage', codePattern: 'df -h', example: 'df -h', tags: ['disk', 'basics'] },
  { scenario: 'Check size of current directory', codePattern: 'du -sh .', example: 'du -sh .', tags: ['disk', 'basics'] },
  { scenario: 'Show sizes of all items in a folder', codePattern: 'du -sh *', example: 'du -sh *', tags: ['disk', 'basics'] },
  { scenario: 'List block devices and mount points', codePattern: 'lsblk', example: 'lsblk', tags: ['disk', 'basics'] },

  // Processes
  { scenario: 'List all running processes', codePattern: 'ps aux', example: 'ps aux', tags: ['process', 'basics'] },
  { scenario: 'Find your own processes', codePattern: 'ps -u $USER', example: 'ps -u $USER', tags: ['process', 'basics'] },
  { scenario: 'Search for a process by name', codePattern: 'ps aux | grep', example: "ps aux | grep nginx", tags: ['process', 'basics'] },
  { scenario: 'Get PID of a process by name', codePattern: 'pgrep name', example: 'pgrep ssh', tags: ['process', 'basics'] },
  { scenario: 'Terminate a process by PID', codePattern: 'kill PID', example: 'kill 12345', tags: ['process', 'basics'] },
  { scenario: 'Force kill an unresponsive process', codePattern: 'kill -9 PID', example: 'kill -9 12345', tags: ['process', 'basics'] },
  { scenario: 'Kill all processes matching a name', codePattern: 'pkill name', example: 'pkill -f "node server"', tags: ['process', 'basics'] },
  { scenario: 'Run a command in the background', codePattern: 'cmd &', example: 'node server.js &', tags: ['process', 'basics'] },
  { scenario: 'Keep a command running after logout', codePattern: 'nohup cmd &', example: 'nohup ./backup.sh &', tags: ['process', 'basics'] },
  { scenario: 'List background jobs in current shell', codePattern: 'jobs', example: 'jobs', tags: ['process', 'basics'] },
  { scenario: 'Bring a background job to foreground', codePattern: 'fg', example: 'fg %1', tags: ['process', 'basics'] },

  // Permissions
  { scenario: 'Make a script executable', codePattern: 'chmod +x', example: 'chmod +x deploy.sh', tags: ['permissions', 'basics'] },
  { scenario: 'Set file permissions to 755', codePattern: 'chmod 755', example: 'chmod 755 script.sh', tags: ['permissions', 'basics'] },
  { scenario: 'Set file permissions to 644', codePattern: 'chmod 644', example: 'chmod 644 config.json', tags: ['permissions', 'basics'] },
  { scenario: 'Give read permission to everyone', codePattern: 'chmod +r', example: 'chmod +r shared.txt', tags: ['permissions', 'basics'] },
  { scenario: 'Remove write permission for others', codePattern: 'chmod o-w', example: 'chmod o-w secret.key', tags: ['permissions', 'basics'] },
  { scenario: 'Change file owner', codePattern: 'chown user file', example: 'sudo chown www-data index.html', tags: ['permissions', 'basics'] },
  { scenario: 'Run a command as root', codePattern: 'sudo cmd', example: 'sudo systemctl restart nginx', tags: ['permissions', 'basics'] },
  { scenario: 'Switch to another user', codePattern: 'su - user', example: 'su - postgres', tags: ['permissions', 'basics'] },
  { scenario: 'Show default permission mask', codePattern: 'umask', example: 'umask', tags: ['permissions', 'basics'] },

  // Networking
  { scenario: 'Test connectivity to a host', codePattern: 'ping host', example: 'ping -c 4 google.com', tags: ['network', 'basics'] },
  { scenario: 'Download a file from a URL', codePattern: 'curl -O url', example: 'curl -O https://example.com/file.zip', tags: ['network', 'basics'] },
  { scenario: 'Fetch a URL and show response headers', codePattern: 'curl -I url', example: 'curl -I https://example.com', tags: ['network', 'basics'] },
  { scenario: 'Download a file with wget', codePattern: 'wget url', example: 'wget https://example.com/data.csv', tags: ['network', 'basics'] },
  { scenario: 'Connect to a remote server', codePattern: 'ssh user@host', example: 'ssh user@192.168.1.10', tags: ['network', 'basics'] },
  { scenario: 'Copy a file to a remote server', codePattern: 'scp file user@host:', example: 'scp report.pdf user@server:/tmp/', tags: ['network', 'basics'] },
  { scenario: 'Copy a file from a remote server', codePattern: 'scp user@host:file .', example: 'scp user@server:/var/log/app.log .', tags: ['network', 'basics'] },
  { scenario: 'Look up IP address of a domain', codePattern: 'nslookup domain', example: 'nslookup google.com', tags: ['network', 'basics'] },
  { scenario: 'Resolve DNS with dig', codePattern: 'dig domain', example: 'dig example.com +short', tags: ['network', 'basics'] },
  { scenario: 'Show listening network ports', codePattern: 'ss -tlnp', example: 'ss -tlnp', tags: ['network', 'basics'] },
  { scenario: 'Test if a port is open on a host', codePattern: 'nc -zv host port', example: 'nc -zv localhost 8080', tags: ['network', 'basics'] },

  // Archives
  { scenario: 'Create a gzip compressed archive', codePattern: 'tar -czf', example: 'tar -czf backup.tar.gz myfolder/', tags: ['archive', 'basics'] },
  { scenario: 'Extract a .tar.gz archive', codePattern: 'tar -xzf', example: 'tar -xzf backup.tar.gz', tags: ['archive', 'basics'] },
  { scenario: 'List contents of an archive without extracting', codePattern: 'tar -tzf', example: 'tar -tzf backup.tar.gz', tags: ['archive', 'basics'] },
  { scenario: 'Compress a file with gzip', codePattern: 'gzip file', example: 'gzip large.log', tags: ['archive', 'basics'] },
  { scenario: 'Decompress a .gz file', codePattern: 'gunzip file.gz', example: 'gunzip large.log.gz', tags: ['archive', 'basics'] },
  { scenario: 'Create a zip archive', codePattern: 'zip -r archive.zip dir', example: 'zip -r project.zip project/', tags: ['archive', 'basics'] },
  { scenario: 'Extract a zip file', codePattern: 'unzip file.zip', example: 'unzip project.zip', tags: ['archive', 'basics'] },

  // Environment & shell
  { scenario: 'Show all environment variables', codePattern: 'env', example: 'env', tags: ['environment', 'basics'] },
  { scenario: 'Print a specific environment variable', codePattern: 'echo $VAR', example: 'echo $HOME', tags: ['environment', 'basics'] },
  { scenario: 'Set an environment variable for this session', codePattern: 'export VAR=val', example: 'export API_KEY=abc123', tags: ['environment', 'basics'] },
  { scenario: 'Show command history', codePattern: 'history', example: 'history | tail -20', tags: ['shell', 'basics'] },
  { scenario: 'Re-run the last command', codePattern: '!!', example: 'sudo !!', tags: ['shell', 'basics'] },
  { scenario: 'Clear the terminal screen', codePattern: 'clear', example: 'clear', tags: ['terminal', 'basics'] },
  { scenario: 'Read the manual for a command', codePattern: 'man cmd', example: 'man ls', tags: ['help', 'basics'] },
  { scenario: 'Show brief help for a command', codePattern: 'cmd --help', example: 'grep --help', tags: ['help', 'basics'] },
  { scenario: 'Create an alias for a long command', codePattern: "alias name='cmd'", example: "alias ll='ls -la'", tags: ['shell', 'basics'] },
  { scenario: 'List all defined aliases', codePattern: 'alias', example: 'alias', tags: ['shell', 'basics'] },

  // Packages (common)
  { scenario: 'Update package list on Ubuntu', codePattern: 'apt update', example: 'sudo apt update', tags: ['packages', 'basics'] },
  { scenario: 'Install a package on Ubuntu', codePattern: 'apt install pkg', example: 'sudo apt install htop', tags: ['packages', 'basics'] },
  { scenario: 'Remove a package on Ubuntu', codePattern: 'apt remove pkg', example: 'sudo apt remove old-package', tags: ['packages', 'basics'] },
  { scenario: 'Search for available packages', codePattern: 'apt search keyword', example: 'apt search nginx', tags: ['packages', 'basics'] },

  // Docker basics
  { scenario: 'List running Docker containers', codePattern: 'docker ps', example: 'docker ps', tags: ['docker', 'basics'] },
  { scenario: 'List all Docker containers', codePattern: 'docker ps -a', example: 'docker ps -a', tags: ['docker', 'basics'] },
  { scenario: 'View Docker container logs', codePattern: 'docker logs', example: 'docker logs my-container', tags: ['docker', 'basics'] },
  { scenario: 'Start a stopped container', codePattern: 'docker start', example: 'docker start my-container', tags: ['docker', 'basics'] },
  { scenario: 'Stop a running container', codePattern: 'docker stop', example: 'docker stop my-container', tags: ['docker', 'basics'] },
  { scenario: 'Run a command inside a container', codePattern: 'docker exec', example: 'docker exec -it my-container sh', tags: ['docker', 'basics'] },
  { scenario: 'List Docker images', codePattern: 'docker images', example: 'docker images', tags: ['docker', 'basics'] },
  { scenario: 'Pull a Docker image', codePattern: 'docker pull image', example: 'docker pull nginx:latest', tags: ['docker', 'basics'] },
  { scenario: 'Remove a Docker container', codePattern: 'docker rm', example: 'docker rm my-container', tags: ['docker', 'basics'] },

  // Git basics (terminal)
  { scenario: 'Check git repository status', codePattern: 'git status', example: 'git status', tags: ['git', 'basics'] },
  { scenario: 'See which branch you are on', codePattern: 'git branch', example: 'git branch', tags: ['git', 'basics'] },
  { scenario: 'View recent commit history', codePattern: 'git log --oneline', example: 'git log --oneline -10', tags: ['git', 'basics'] },
  { scenario: 'Stage a file for commit', codePattern: 'git add file', example: 'git add README.md', tags: ['git', 'basics'] },
  { scenario: 'Stage all changed files', codePattern: 'git add .', example: 'git add .', tags: ['git', 'basics'] },
  { scenario: 'Commit staged changes with a message', codePattern: 'git commit -m', example: 'git commit -m "fix: update config"', tags: ['git', 'basics'] },
  { scenario: 'Pull latest changes from remote', codePattern: 'git pull', example: 'git pull origin main', tags: ['git', 'basics'] },
  { scenario: 'Push local commits to remote', codePattern: 'git push', example: 'git push origin main', tags: ['git', 'basics'] },
  { scenario: 'See unstaged differences', codePattern: 'git diff', example: 'git diff', tags: ['git', 'basics'] },
  { scenario: 'Clone a remote repository', codePattern: 'git clone url', example: 'git clone https://github.com/user/repo.git', tags: ['git', 'basics'] },

  // K8s basics
  { scenario: 'List pods in default namespace', codePattern: 'kubectl get pods', example: 'kubectl get pods', tags: ['kubernetes', 'basics'] },
  { scenario: 'List pods in a specific namespace', codePattern: 'kubectl get pods -n', example: 'kubectl get pods -n staging', tags: ['kubernetes', 'basics'] },
  { scenario: 'Describe a pod for details', codePattern: 'kubectl describe pod', example: 'kubectl describe pod my-pod', tags: ['kubernetes', 'basics'] },
  { scenario: 'View logs from a pod', codePattern: 'kubectl logs pod', example: 'kubectl logs my-pod', tags: ['kubernetes', 'basics'] },
  { scenario: 'Apply a Kubernetes manifest', codePattern: 'kubectl apply -f', example: 'kubectl apply -f deployment.yaml', tags: ['kubernetes', 'basics'] },

  // Logs
  { scenario: 'View last 50 systemd journal entries', codePattern: 'journalctl -n 50', example: 'journalctl -n 50 --no-pager', tags: ['logs', 'basics'] },
  { scenario: 'Follow systemd journal live', codePattern: 'journalctl -f', example: 'journalctl -f', tags: ['logs', 'basics'] },
  { scenario: 'Read kernel ring buffer messages', codePattern: 'dmesg', example: 'dmesg | tail -20', tags: ['logs', 'basics'] },
  { scenario: 'Write a message to system log', codePattern: 'logger msg', example: 'logger "backup completed"', tags: ['logs', 'basics'] },

  // Cron & scheduling
  { scenario: 'Edit your personal crontab', codePattern: 'crontab -e', example: 'crontab -e', tags: ['scheduling', 'basics'] },
  { scenario: 'List your scheduled cron jobs', codePattern: 'crontab -l', example: 'crontab -l', tags: ['scheduling', 'basics'] },
  { scenario: 'Run a command at a specific time once', codePattern: 'at time', example: 'echo "./backup.sh" | at 02:00', tags: ['scheduling', 'basics'] },

  // xargs & find combos
  { scenario: 'Delete all .tmp files found by find', codePattern: 'find | xargs rm', example: "find . -name '*.tmp' | xargs rm", tags: ['search', 'basics'] },
  { scenario: 'Search inside every file found by find', codePattern: 'find -exec grep', example: "find . -name '*.conf' -exec grep -H 'port' {} \\;", tags: ['search', 'basics'] },
  { scenario: 'Count files in a directory tree', codePattern: 'find | wc -l', example: "find . -type f | wc -l", tags: ['search', 'basics'] },

  // Diff & compare
  { scenario: 'Compare two text files', codePattern: 'diff file1 file2', example: 'diff old.conf new.conf', tags: ['text', 'basics'] },
  { scenario: 'Check if two files are identical', codePattern: 'cmp file1 file2', example: 'cmp file1.txt file2.txt', tags: ['text', 'basics'] },

  // File info
  { scenario: 'Determine file type', codePattern: 'file path', example: 'file script.sh', tags: ['files', 'basics'] },
  { scenario: 'Show detailed file metadata', codePattern: 'stat file', example: 'stat /etc/passwd', tags: ['files', 'basics'] },
  { scenario: 'Get just the filename from a path', codePattern: 'basename path', example: 'basename /var/log/nginx/access.log', tags: ['files', 'basics'] },
  { scenario: 'Get just the directory from a path', codePattern: 'dirname path', example: 'dirname /var/log/nginx/access.log', tags: ['files', 'basics'] },

  // Hashing & encoding
  { scenario: 'Calculate MD5 checksum of a file', codePattern: 'md5sum file', example: 'md5sum download.iso', tags: ['files', 'basics'] },
  { scenario: 'Calculate SHA256 checksum of a file', codePattern: 'sha256sum file', example: 'sha256sum release.tar.gz', tags: ['files', 'basics'] },
  { scenario: 'Base64 encode a string', codePattern: 'echo | base64', example: "echo -n 'hello' | base64", tags: ['text', 'basics'] },

  // Sleep & wait
  { scenario: 'Pause execution for N seconds', codePattern: 'sleep N', example: 'sleep 5', tags: ['shell', 'basics'] },
  { scenario: 'Wait for a background process to finish', codePattern: 'wait', example: 'wait', tags: ['process', 'basics'] },

  // Mount & disk
  { scenario: 'Show mounted filesystems', codePattern: 'mount', example: 'mount | column -t', tags: ['disk', 'basics'] },
  { scenario: 'Check inode usage on disks', codePattern: 'df -i', example: 'df -i', tags: ['disk', 'basics'] },

  // Users
  { scenario: 'See who is logged into the system', codePattern: 'who', example: 'who', tags: ['system', 'basics'] },
  { scenario: 'Show logged-in users and their activity', codePattern: 'w', example: 'w', tags: ['system', 'basics'] },
  { scenario: 'List the last logged-in users', codePattern: 'last', example: 'last | head -10', tags: ['system', 'basics'] },

  // sed/awk intro
  { scenario: 'Replace text in a file in-place', codePattern: "sed -i 's/a/b/'", example: "sed -i 's/debug/info/' app.conf", tags: ['text', 'basics'] },
  { scenario: 'Print lines matching a pattern with sed', codePattern: "sed -n '/pat/p'", example: "sed -n '/ERROR/p' app.log", tags: ['text', 'basics'] },
  { scenario: 'Print the first column of a file', codePattern: "awk '{print $1}'", example: "awk '{print $1}' data.tsv", tags: ['text', 'basics'] },
  { scenario: 'Print lines where a column equals a value', codePattern: "awk '$N==val'", example: "awk '$3 == \"error\"' log.txt", tags: ['text', 'basics'] },

  // echo & printf
  { scenario: 'Print text to the terminal', codePattern: 'echo text', example: 'echo "Hello, World!"', tags: ['shell', 'basics'] },
  { scenario: 'Print formatted output', codePattern: 'printf format', example: 'printf "Name: %s\\n" "Alice"', tags: ['shell', 'basics'] },
  { scenario: 'Write text into a file with echo', codePattern: 'echo > file', example: 'echo "server_name localhost;" > nginx.conf', tags: ['shell', 'basics'] },

  // test & conditions
  { scenario: 'Test if a file exists', codePattern: 'test -f file', example: 'test -f /etc/passwd && echo "exists"', tags: ['shell', 'basics'] },
  { scenario: 'Test if a directory exists', codePattern: 'test -d dir', example: 'test -d /var/www && echo "exists"', tags: ['shell', 'basics'] },
  { scenario: 'Compare two strings in a script', codePattern: '[ "$a" = "$b" ]', example: '[ "$USER" = "root" ] && echo "root user"', tags: ['shell', 'basics'] },

  // tree & ls extras
  { scenario: 'Show directory tree structure', codePattern: 'tree', example: 'tree -L 2 src/', tags: ['files', 'basics'] },
  { scenario: 'List files with inode numbers', codePattern: 'ls -i', example: 'ls -i', tags: ['files', 'basics'] },
  { scenario: 'List files showing file types', codePattern: 'ls -F', example: 'ls -F', tags: ['files', 'basics'] },

  // watch
  { scenario: 'Re-run a command every 2 seconds', codePattern: 'watch -n 2 cmd', example: 'watch -n 2 df -h', tags: ['monitoring', 'basics'] },

  // cal & time
  { scenario: 'Show a calendar for the current month', codePattern: 'cal', example: 'cal', tags: ['system', 'basics'] },
  { scenario: 'Time how long a command takes', codePattern: 'time cmd', example: 'time npm run build', tags: ['system', 'basics'] },

  // seq
  { scenario: 'Generate a sequence of numbers', codePattern: 'seq N', example: 'seq 1 10', tags: ['shell', 'basics'] },

  // paste & join
  { scenario: 'Merge two files side by side', codePattern: 'paste f1 f2', example: 'paste names.txt scores.txt', tags: ['text', 'basics'] },

  // tee extras
  { scenario: 'Append output to a file while displaying it', codePattern: 'tee -a', example: 'echo "new line" | tee -a log.txt', tags: ['pipes', 'basics'] },

  // source
  { scenario: 'Load variables from a script into current shell', codePattern: 'source file', example: 'source .env', tags: ['environment', 'basics'] },

  // pushd/popd
  { scenario: 'Save current directory and switch', codePattern: 'pushd dir', example: 'pushd /var/log', tags: ['navigation', 'basics'] },
  { scenario: 'Return to directory saved with pushd', codePattern: 'popd', example: 'popd', tags: ['navigation', 'basics'] },

  // realpath
  { scenario: 'Resolve the absolute path of a file', codePattern: 'realpath file', example: 'realpath ../config/app.yml', tags: ['files', 'basics'] },

  // mktemp
  { scenario: 'Create a temporary file safely', codePattern: 'mktemp', example: 'mktemp /tmp/script.XXXXXX', tags: ['files', 'basics'] },

  // split
  { scenario: 'Split a large file into smaller parts', codePattern: 'split -l N', example: 'split -l 1000 bigfile.txt part_', tags: ['files', 'basics'] },

  // head/tail combos
  { scenario: 'Get lines 10 through 20 of a file', codePattern: 'sed -n', example: "sed -n '10,20p' file.txt", tags: ['text', 'basics'] },
  { scenario: 'Show last 5 lines and follow new ones', codePattern: 'tail -n 5 -f', example: 'tail -n 5 -f app.log', tags: ['logs', 'basics'] },

  // curl extras
  { scenario: 'Download a file silently showing errors only', codePattern: 'curl -fsS -O', example: 'curl -fsS -O https://example.com/file.tar.gz', tags: ['network', 'basics'] },
  { scenario: 'POST JSON data to an API', codePattern: 'curl -X POST -d', example: 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api.example.com/data', tags: ['network', 'basics'] },

  // ssh extras
  { scenario: 'Run a single command on a remote host', codePattern: 'ssh user@host cmd', example: 'ssh user@server "df -h"', tags: ['network', 'basics'] },
  { scenario: 'Copy a directory recursively to remote', codePattern: 'scp -r', example: 'scp -r ./dist user@server:/var/www/', tags: ['network', 'basics'] },

  // systemctl basics
  { scenario: 'Check status of a systemd service', codePattern: 'systemctl status', example: 'systemctl status nginx', tags: ['system', 'basics'] },
  { scenario: 'Start a systemd service', codePattern: 'systemctl start', example: 'sudo systemctl start nginx', tags: ['system', 'basics'] },
  { scenario: 'Stop a systemd service', codePattern: 'systemctl stop', example: 'sudo systemctl stop nginx', tags: ['system', 'basics'] },
  { scenario: 'Restart a systemd service', codePattern: 'systemctl restart', example: 'sudo systemctl restart nginx', tags: ['system', 'basics'] },
  { scenario: 'Enable a service to start on boot', codePattern: 'systemctl enable', example: 'sudo systemctl enable nginx', tags: ['system', 'basics'] },

  // lscpu / hw
  { scenario: 'Show CPU architecture information', codePattern: 'lscpu', example: 'lscpu', tags: ['system', 'basics'] },
  { scenario: 'List USB devices connected', codePattern: 'lsusb', example: 'lsusb', tags: ['system', 'basics'] },

  // chmod recursive
  { scenario: 'Make all scripts in a folder executable', codePattern: 'chmod +x *.sh', example: 'chmod +x scripts/*.sh', tags: ['permissions', 'basics'] },
  { scenario: 'Set permissions recursively on a directory', codePattern: 'chmod -R', example: 'chmod -R 755 public/', tags: ['permissions', 'basics'] },

  // grep with context
  { scenario: 'Show 3 lines after each match', codePattern: 'grep -A 3', example: "grep -A 3 'Exception' app.log", tags: ['search', 'basics'] },
  { scenario: 'Show 3 lines before each match', codePattern: 'grep -B 3', example: "grep -B 3 'Caused by' app.log", tags: ['search', 'basics'] },

  // sort uniq combos
  { scenario: 'Find most common lines in a file', codePattern: 'sort | uniq -c | sort -nr', example: 'sort access.log | uniq -c | sort -nr | head', tags: ['text', 'basics'] },

  // variable expansion
  { scenario: 'Use a variable in a command', codePattern: '$VAR', example: 'echo "Home is $HOME"', tags: ['environment', 'basics'] },
  { scenario: 'Use command output as a variable', codePattern: '$(cmd)', example: 'echo "Today is $(date +%A)"', tags: ['environment', 'basics'] },

  // history search
  { scenario: 'Search your command history', codePattern: 'history | grep', example: "history | grep docker", tags: ['shell', 'basics'] },

  // npm/node basics in terminal
  { scenario: 'Install npm dependencies for a project', codePattern: 'npm install', example: 'npm install', tags: ['development', 'basics'] },
  { scenario: 'Run a package.json script', codePattern: 'npm run script', example: 'npm run dev', tags: ['development', 'basics'] },
  { scenario: 'Check Node.js version', codePattern: 'node -v', example: 'node -v', tags: ['development', 'basics'] },
  { scenario: 'Check npm version', codePattern: 'npm -v', example: 'npm -v', tags: ['development', 'basics'] },

  // python basics
  { scenario: 'Run a Python script', codePattern: 'python3 script.py', example: 'python3 process_data.py', tags: ['development', 'basics'] },
  { scenario: 'Start Python interactive shell', codePattern: 'python3', example: 'python3', tags: ['development', 'basics'] },
  { scenario: 'Install a Python package with pip', codePattern: 'pip install pkg', example: 'pip install requests', tags: ['development', 'basics'] },

  // permissions check
  { scenario: 'List files with permission details', codePattern: 'ls -l', example: 'ls -l /etc', tags: ['permissions', 'basics'] },
  { scenario: 'Find files owned by a specific user', codePattern: 'find -user', example: 'find /home -user deploy 2>/dev/null', tags: ['permissions', 'basics'] },

  // empty files
  { scenario: 'Find empty files in a directory', codePattern: 'find -empty', example: 'find . -type f -empty', tags: ['search', 'basics'] },
  { scenario: 'Truncate a file to zero bytes', codePattern: '> file', example: '> empty.log', tags: ['files', 'basics'] },

  // more navigation
  { scenario: 'Open current directory in default file manager', codePattern: 'xdg-open .', example: 'xdg-open .', tags: ['navigation', 'basics'] },
  { scenario: 'Print full path after changing directory', codePattern: 'cd dir && pwd', example: 'cd /etc && pwd', tags: ['navigation', 'basics'] },
]

// Generate additional variations programmatically to reach 280+
const EXTRA = []
const cmds = ['ls', 'cat', 'grep', 'find', 'chmod', 'curl', 'ssh', 'tar', 'ps', 'kill', 'head', 'tail', 'wc', 'sort', 'cp', 'mv', 'rm', 'mkdir', 'touch', 'echo']
const actions = [
  { s: 'Practice using {cmd} on a sample file in /tmp', p: '{cmd}', e: '{cmd} /tmp/sample.txt', t: ['practice', 'basics'] },
  { s: 'Run {cmd} with --help to learn its options', p: '{cmd} --help', e: '{cmd} --help', t: ['help', 'basics'] },
  { s: 'Combine {cmd} with pipe to filter output', p: '{cmd} | head', e: '{cmd} /var/log/syslog | head -5', t: ['pipes', 'basics'] },
  { s: 'Save {cmd} output to a file for later review', p: '{cmd} > out.txt', e: '{cmd} > output.txt', t: ['pipes', 'basics'] },
  { s: 'Time how long {cmd} takes to run', p: 'time {cmd}', e: 'time {cmd}', t: ['system', 'basics'] },
]

let extraIdx = 0
for (const cmd of cmds) {
  for (const a of actions) {
    if (TEMPLATES.length + EXTRA.length >= 290) break
    EXTRA.push({
      scenario: a.s.replace(/\{cmd\}/g, cmd),
      codePattern: a.p.replace(/\{cmd\}/g, cmd),
      example: a.e.replace(/\{cmd\}/g, cmd),
      tags: a.t,
    })
    extraIdx++
  }
}

const allBasic = [...TEMPLATES, ...EXTRA].map((s, i) => ({
  id: `scenario-basic-${String(i + 1).padStart(4, '0')}`,
  ...s,
  difficulty: 'basic',
}))

// Deduplicate by scenario text
const seen = new Set()
const uniqueBasic = allBasic.filter((s) => {
  if (seen.has(s.scenario)) return false
  seen.add(s.scenario)
  return true
})

const existing = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'))
const nonBasic = existing.filter((s) => s.difficulty !== 'basic' && !s.id.startsWith('scenario-basic-'))

const merged = [...uniqueBasic, ...nonBasic]

fs.writeFileSync(scenariosPath, JSON.stringify(merged, null, 2))
console.log(`Generated ${uniqueBasic.length} basic scenarios. Total scenarios: ${merged.length}`)
console.log(`Breakdown: basic=${uniqueBasic.length}, other=${nonBasic.length}`)
