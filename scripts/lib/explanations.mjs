/** Generates full linear explanations combining command purpose, type, and category context */

const TYPE_CONTEXT = {
  'Shell Builtin': 'built directly into your shell (bash, zsh, etc.) and executes without launching a separate program, which makes it fast for everyday session tasks like changing directories, setting variables, or managing job control',
  'Shell Operator': 'not a standalone program but a shell language construct used to connect commands, redirect input/output streams, or chain operations together in a single pipeline',
  'POSIX Utility': 'a standardized command defined by POSIX and available across Unix, Linux, and macOS systems, ensuring portable scripts that work on most platforms without modification',
  'GNU Coreutils': 'part of the GNU core utilities — the foundational toolkit shipped with virtually every Linux distribution for file manipulation, text processing, and basic system tasks',
  'Filter / Stream Processor': 'designed to read input (from files or pipes), transform or filter it, and write results to stdout — making it ideal for chaining with other commands in pipelines',
  'Network Utility': 'used to diagnose, configure, or interact with network interfaces, remote hosts, and protocols — essential for connectivity troubleshooting, deployments, and remote administration',
  'Process Utility': 'manages running processes on the system: listing them, sending signals, adjusting priority, or monitoring resource consumption during debugging and performance analysis',
  'Filesystem Utility': 'operates directly on files and directories — creating, copying, moving, listing, or inspecting paths on the filesystem tree that every other tool depends on',
  'System Utility': 'reports or controls low-level system state such as hardware info, kernel messages, mounted volumes, uptime, and environment configuration needed for administration',
  'Linux Specific': 'available primarily on Linux systems and often relies on kernel features or systemd interfaces not present on BSD or macOS — common in production server environments',
  'BSD / macOS Utility': 'originates from BSD Unix or Apple\'s Darwin layer and is the standard on macOS and BSD systems, sometimes with different flags than its GNU Linux counterpart',
  'Security Tool': 'handles authentication, encryption, access control, auditing, or hardening tasks that protect systems, credentials, and data in production environments',
  'Archive Utility': 'packages files into compressed archives or extracts them — critical for backups, software distribution, log rotation, and transferring bundles between servers',
  'Package Manager': 'installs, updates, removes, and queries software packages and their dependencies on a specific Linux distribution or ecosystem',
  'Development Tool': 'supports the software development lifecycle — compiling code, version control, debugging binaries, profiling performance, or formatting structured data',
  'Container CLI': 'manages container images and running containers through a runtime like Docker or Podman, forming the backbone of modern CI/CD and microservice deployments',
  'Kubernetes CLI': 'interacts with Kubernetes clusters to deploy, scale, inspect, and troubleshoot workloads running in pods across distributed production infrastructure',
  'Cloud CLI': 'communicates with cloud provider APIs to provision infrastructure, manage resources, and automate operations across AWS, GCP, Azure, and similar platforms',
  'Database Client': 'connects to database servers from the terminal to run queries, import dumps, inspect schemas, and perform administrative tasks without a GUI',
  'Monitoring Utility': 'collects logs, metrics, or system events to help developers and SREs observe application health, trace incidents, and maintain uptime in production',
  'Text Utility': 'processes, formats, or analyzes plain-text data — the raw material of config files, logs, CSV exports, and most command-line output',
}

const CATEGORY_USAGE = {
  'File & Directory': 'navigating the filesystem, organizing project files, and preparing paths before builds or deployments',
  'Text Processing': 'searching logs, transforming config files, parsing output, and building powerful multi-command pipelines',
  'Process Management': 'monitoring what is running on a server, killing stuck processes, and understanding resource usage during incidents',
  'User & Permissions': 'controlling who can access files and services, managing accounts, and enforcing least-privilege security policies',
  'Networking': 'testing connectivity, transferring files remotely, inspecting open ports, and debugging latency or DNS issues',
  'System Information': 'understanding the machine you are on — CPU, memory, OS version, and kernel messages — before making changes',
  'Disk & Filesystem': 'checking disk space, mounting volumes, and preventing outages caused by full partitions in production',
  'Archives & Compression': 'packaging releases, compressing log backups, and moving large directory trees between environments',
  'Package Management': 'installing runtime dependencies, security patches, and development libraries on servers and workstations',
  'Shell Builtins': 'controlling your interactive shell session, scripting environment, and command history efficiently',
  'Development Tools': 'building, testing, and shipping code — from compiling binaries to running linters and formatters in CI',
  'Security': 'auditing systems, managing keys and certificates, and hardening access in compliance-sensitive environments',
  'Scheduling & Automation': 'running tasks on a schedule, automating repetitive maintenance, and orchestrating batch jobs',
  'Environment & Variables': 'configuring shell behavior, exporting variables for child processes, and managing runtime configuration',
  'Pipes & Redirection': 'wiring commands together so the output of one becomes the input of another — the core of Unix power',
  'Terminal & Session': 'managing long-running sessions, multiplexers, and terminal settings for productive remote work',
  'Search & Find': 'locating files, binaries, and documentation across large directory trees and unfamiliar systems',
  'macOS / BSD': 'day-to-day administration on Apple Silicon Macs or BSD servers where GNU flags may differ',
  'Linux Specific': 'server administration tasks unique to Linux kernels, systemd, and common production distributions',
  'Containers & Cloud': 'deploying microservices, managing cloud infrastructure, and operating containerized workloads at scale',
  'Database CLI': 'querying production databases, running migrations, and exporting data during incidents or analytics',
  'Monitoring & Logs': 'tailing application logs, inspecting journal entries, and correlating events during outage response',
}

const TAG_USAGE = {
  listing: 'browsing folder contents to verify deployments or inspect permissions',
  navigation: 'moving between directories in scripts and interactive sessions',
  create: 'creating new files or directories as part of setup workflows',
  delete: 'removing obsolete files, caches, or temporary build artifacts safely',
  copy: 'duplicating files and trees for backups, releases, or environment promotion',
  rename: 'renaming or relocating files during refactors and configuration updates',
  search: 'finding text patterns across codebases, logs, and configuration files',
  links: 'managing symbolic and hard links for version pinning and path abstraction',
  paths: 'resolving, splitting, or normalizing file paths in portable shell scripts',
  docker: 'operating container workloads in development, staging, and production clusters',
  kubernetes: 'managing pod-based workloads, rollouts, and cluster resources at scale',
  containers: 'running isolated application environments without full virtual machines',
  network: 'configuring or diagnosing network connectivity between services',
  logs: 'reading and filtering log output during debugging and incident response',
  security: 'enforcing access controls, scanning for vulnerabilities, and managing secrets',
  monitoring: 'observing system health, metrics, and events in real time',
  compression: 'reducing file size for storage efficiency and faster transfers',
  database: 'interacting with relational or document databases from the terminal',
  devops: 'automating infrastructure, deployments, and operational runbooks',
  cicd: 'integrating into continuous integration and delivery pipelines',
  isolation: 'sandboxing processes or filesystems for security and reproducibility',
}

function capitalize(s) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function expandVerbPhrase(short) {
  const s = short.trim()
  const lower = s.charAt(0).toLowerCase() + s.slice(1)
  if (/^(list|show|print|display|get|fetch|read|view)/i.test(s)) {
    return lower.endsWith('s') ? lower : lower.replace(/^(list|show|print|display|get|fetch|read|view)/i, (m) => m.toLowerCase() + 's')
  }
  if (/^(change|create|remove|delete|copy|move|run|execute|start|stop|kill|send|check|test|search|find|compress|extract|install|update|manage|monitor|connect|transfer|configure|set|unset|export|source|evaluate|schedule|mount|unmount|inspect|query|build|deploy|scale|apply|describe)/i.test(s)) {
    return lower
  }
  if (s.endsWith('ing')) return lower
  if (s.endsWith('e')) return lower + 's'
  if (s.endsWith('y') && !/[aeiou]y$/i.test(s)) return lower.slice(0, -1) + 'ies'
  return lower + 's'
}

function buildTagSentence(tags) {
  if (!tags?.length) return ''
  const usages = tags.map((t) => TAG_USAGE[t]).filter(Boolean)
  if (!usages.length) return ''
  if (usages.length === 1) return ` Developers typically rely on it for ${usages[0]}.`
  return ` It is especially useful for ${usages.slice(0, -1).join(', ')}, and ${usages.at(-1)}.`
}

/** Manual rich explanations for key commands */
const MANUAL_EXPLANATIONS = {
  ls: 'The ls command is a Filesystem Utility that lists the files and subdirectories inside a given path, showing names, sizes, permissions, and timestamps. Built into every Unix and Linux system as part of the core file toolkit, it is the first command most developers use to orient themselves on a new server or project directory.',
  grep: 'The grep command is a Filter / Stream Processor that searches plain-text input for lines matching a regular expression or fixed string. As one of the most essential POSIX utilities, it powers log analysis, code searches, and pipeline filtering — often chained with awk, sed, and tail during production incident response.',
  find: 'The find command is a Filesystem Utility that recursively walks directory trees to locate files by name, type, size, modification time, or permissions. Unlike simple listing tools, find can execute actions on every match, making it indispensable for cleanup scripts, security audits, and automated maintenance on large servers.',
  awk: 'The awk command is a Filter / Stream Processor and complete text-processing language that splits input into fields and applies pattern-action rules to each line. It is the go-to tool for parsing columnar data such as log files, CSV exports, and command output where cut and grep alone are insufficient.',
  sed: 'The sed command is a Filter / Stream Processor that performs non-interactive stream editing — substituting text, deleting lines, or inserting content as data flows through a pipeline. It is widely used for batch config file updates, log normalization, and quick one-liner transformations in shell scripts.',
  docker: 'The docker command is a Container CLI that manages the full lifecycle of containers and images — building, running, inspecting, networking, and cleaning up isolated application environments. It is the standard interface to the Docker Engine and the foundation of modern DevOps workflows, local development, and CI/CD pipelines.',
  kubectl: 'The kubectl command is a Kubernetes CLI that communicates with a cluster API server to create, update, delete, and inspect resources such as pods, deployments, services, and config maps. Every Kubernetes operator and backend engineer uses it daily for rollouts, log tailing, port forwarding, and production incident debugging.',
  ssh: 'The ssh command is a Network Utility that establishes encrypted remote shell sessions or executes single commands on distant hosts over the SSH protocol. It is the primary way developers and administrators access production servers, tunnel ports, and transfer files securely without exposing credentials on the network.',
  curl: 'The curl command is a Network Utility that transfers data to or from a URL using dozens of protocols, most commonly HTTP and HTTPS. Developers use it to test APIs, download files, inspect response headers, and script webhook integrations directly from the terminal without a browser or GUI client.',
  tar: 'The tar command is an Archive Utility that bundles multiple files and directories into a single archive and pairs with gzip, bzip2, or xz for compression. It remains the standard format for software releases, server backups, and transferring project trees between machines while preserving permissions and directory structure.',
  chmod: 'The chmod command is a Filesystem Utility that changes the read, write, and execute permissions on files and directories using either symbolic notation (u+x) or octal mode (755). Correct permission management prevents security vulnerabilities and ensures scripts, web roots, and SSH keys have the access levels the system requires.',
  cd: 'The cd command is a Shell Builtin that changes the shell\'s current working directory without spawning a new process. Because it must modify the shell\'s own state, cd cannot be implemented as an external program — it is always built into bash, zsh, and other shells you use interactively and in scripts.',
}

export function buildFullExplanation(cmd, type) {
  if (MANUAL_EXPLANATIONS[cmd.id] || MANUAL_EXPLANATIONS[cmd.name.split(' ')[0]]) {
    const manual = MANUAL_EXPLANATIONS[cmd.id] ?? MANUAL_EXPLANATIONS[cmd.name.split(' ')[0]]
    const tagExtra = buildTagSentence(cmd.tags)
    if (tagExtra && !manual.includes(tagExtra.trim())) {
      return manual + tagExtra
    }
    return manual
  }

  const name = cmd.name
  const short = cmd.explanation.trim()
  const verb = expandVerbPhrase(short)
  const typeCtx = TYPE_CONTEXT[type] ?? 'a command-line tool used in Unix and Linux environments'
  const categoryCtx = CATEGORY_USAGE[cmd.category] ?? 'general terminal operations and system administration'
  const tagSentence = buildTagSentence(cmd.tags)

  const aliasNote = cmd.aliases?.length
    ? ` It is also known as ${cmd.aliases.join(', ')} on some systems.`
    : ''

  return (
    `The ${name} command is a ${type} that ${verb.endsWith('.') ? verb.slice(0, -1) : verb}. ` +
    `As a ${type.toLowerCase()}, it is ${typeCtx}. ` +
    `Within the ${cmd.category} domain, operators use it for ${categoryCtx}.${tagSentence}${aliasNote}`
  ).replace(/\s+/g, ' ').trim()
}

export function enrichExplanation(cmd, type) {
  return buildFullExplanation(cmd, type)
}
