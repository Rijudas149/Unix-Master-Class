import fs from 'fs';
import path from 'path';
import { enrichCommand } from './lib/enrichment.mjs';

const rootDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..');
const dataDir = path.join(rootDir, 'src', 'data');

const commands = [
  {
    "id": "ls",
    "name": "ls",
    "explanation": "List directory entries",
    "pattern": "ls [options] [path]",
    "example": "ls -lah /var/www",
    "category": "File & Directory",
    "tags": [
      "listing"
    ]
  },
  {
    "id": "cd",
    "name": "cd",
    "explanation": "Change working directory",
    "pattern": "cd [path]",
    "example": "cd /etc/systemd/system",
    "category": "File & Directory",
    "tags": [
      "navigation"
    ]
  },
  {
    "id": "pwd",
    "name": "pwd",
    "explanation": "Print working directory",
    "pattern": "pwd [-P]",
    "example": "pwd -P",
    "category": "File & Directory",
    "tags": [
      "navigation"
    ]
  },
  {
    "id": "mkdir",
    "name": "mkdir",
    "explanation": "Create directories",
    "pattern": "mkdir -p path",
    "example": "mkdir -p /srv/app/releases",
    "category": "File & Directory",
    "tags": [
      "create"
    ]
  },
  {
    "id": "rmdir",
    "name": "rmdir",
    "explanation": "Remove empty directories",
    "pattern": "rmdir dir",
    "example": "rmdir /tmp/empty",
    "category": "File & Directory",
    "tags": [
      "delete"
    ]
  },
  {
    "id": "rm",
    "name": "rm",
    "explanation": "Remove files or directories",
    "pattern": "rm [-rf] path",
    "example": "rm -rf ./node_modules",
    "category": "File & Directory",
    "tags": [
      "delete"
    ]
  },
  {
    "id": "cp",
    "name": "cp",
    "explanation": "Copy files and directories",
    "pattern": "cp [-aR] src dst",
    "example": "cp -a /data/app /backup/app",
    "category": "File & Directory",
    "tags": [
      "copy"
    ]
  },
  {
    "id": "mv",
    "name": "mv",
    "explanation": "Move or rename paths",
    "pattern": "mv src dst",
    "example": "mv app.conf app.conf.bak",
    "category": "File & Directory",
    "tags": [
      "rename"
    ]
  },
  {
    "id": "touch",
    "name": "touch",
    "explanation": "Create file or update timestamps",
    "pattern": "touch file",
    "example": "touch /var/log/app.log",
    "category": "File & Directory",
    "tags": [
      "create"
    ]
  },
  {
    "id": "ln",
    "name": "ln",
    "explanation": "Create links",
    "pattern": "ln -s target link",
    "example": "ln -s /etc/nginx/sites-available/app.conf sites-enabled/",
    "category": "File & Directory",
    "tags": [
      "links"
    ]
  },
  {
    "id": "readlink",
    "name": "readlink",
    "explanation": "Print symlink target",
    "pattern": "readlink [-f] path",
    "example": "readlink -f /proc/self/exe",
    "category": "File & Directory",
    "tags": [
      "links"
    ]
  },
  {
    "id": "realpath",
    "name": "realpath",
    "explanation": "Resolve canonical path",
    "pattern": "realpath path",
    "example": "realpath ../config",
    "category": "File & Directory",
    "tags": [
      "paths"
    ]
  },
  {
    "id": "basename",
    "name": "basename",
    "explanation": "Strip directory from path",
    "pattern": "basename path [suffix]",
    "example": "basename /var/log/nginx/access.log",
    "category": "File & Directory",
    "tags": [
      "paths"
    ]
  },
  {
    "id": "dirname",
    "name": "dirname",
    "explanation": "Strip filename from path",
    "pattern": "dirname path",
    "example": "dirname /etc/nginx/nginx.conf",
    "category": "File & Directory",
    "tags": [
      "paths"
    ]
  },
  {
    "id": "stat",
    "name": "stat",
    "explanation": "Show inode metadata",
    "pattern": "stat [-c fmt] file",
    "example": "stat -c '%a %U %G' /etc/shadow",
    "category": "File & Directory",
    "tags": [
      "metadata"
    ]
  },
  {
    "id": "file",
    "name": "file",
    "explanation": "Detect file type",
    "pattern": "file path",
    "example": "file /usr/bin/python3",
    "category": "File & Directory",
    "tags": [
      "metadata"
    ]
  },
  {
    "id": "tree",
    "name": "tree",
    "explanation": "Display directory tree",
    "pattern": "tree [-L n] path",
    "example": "tree -L 2 /etc/nginx",
    "category": "File & Directory",
    "tags": [
      "listing"
    ]
  },
  {
    "id": "install",
    "name": "install",
    "explanation": "Copy files with modes",
    "pattern": "install -m 644 src dst",
    "example": "install -m 755 deploy.sh /usr/local/bin/deploy",
    "category": "File & Directory",
    "tags": [
      "deploy"
    ]
  },
  {
    "id": "mktemp",
    "name": "mktemp",
    "explanation": "Create temporary file or dir",
    "pattern": "mktemp -d",
    "example": "mktemp -d /tmp/audit.XXXXXX",
    "category": "File & Directory",
    "tags": [
      "temp"
    ]
  },
  {
    "id": "sync",
    "name": "sync",
    "explanation": "Flush filesystem buffers",
    "pattern": "sync",
    "example": "sync",
    "category": "File & Directory",
    "tags": [
      "io"
    ]
  },
  {
    "id": "truncate",
    "name": "truncate",
    "explanation": "Shrink or extend file size",
    "pattern": "truncate -s SIZE file",
    "example": "truncate -s 0 /var/log/app.log",
    "category": "File & Directory",
    "tags": [
      "io"
    ]
  },
  {
    "id": "split",
    "name": "split",
    "explanation": "Split file into chunks",
    "pattern": "split -b SIZE file prefix",
    "example": "split -b 100M archive.tar.gz part-",
    "category": "File & Directory",
    "tags": [
      "io"
    ]
  },
  {
    "id": "shred",
    "name": "shred",
    "explanation": "Securely overwrite file",
    "pattern": "shred -u file",
    "example": "shred -u sensitive.csv",
    "category": "File & Directory",
    "tags": [
      "security"
    ]
  },
  {
    "id": "chattr",
    "name": "chattr",
    "explanation": "Change file attributes on Linux",
    "pattern": "chattr +i file",
    "example": "chattr +i /etc/resolv.conf",
    "category": "File & Directory",
    "tags": [
      "linux"
    ]
  },
  {
    "id": "lsattr",
    "name": "lsattr",
    "explanation": "List file attributes",
    "pattern": "lsattr file",
    "example": "lsattr /etc/resolv.conf",
    "category": "File & Directory",
    "tags": [
      "linux"
    ]
  },
  {
    "id": "namei",
    "name": "namei",
    "explanation": "Trace path resolution permissions",
    "pattern": "namei -l path",
    "example": "namei -l /var/lib/docker",
    "category": "File & Directory",
    "tags": [
      "permissions"
    ]
  },
  {
    "id": "fuser",
    "name": "fuser",
    "explanation": "Show processes using files",
    "pattern": "fuser -v /var/lib/mysql",
    "example": "fuser -v /var/lib/mysql",
    "category": "File & Directory",
    "tags": [
      "process"
    ]
  },
  {
    "id": "lsof-path",
    "name": "lsof",
    "explanation": "List open files on path",
    "pattern": "lsof +D path",
    "example": "lsof +D /var/log",
    "category": "File & Directory",
    "aliases": [
      "lsof"
    ],
    "tags": [
      "debug"
    ]
  },
  {
    "id": "rsync",
    "name": "rsync",
    "explanation": "Efficient remote sync",
    "pattern": "rsync -avz src/ user@host:dst/",
    "example": "rsync -avz --delete ./dist/ prod:/var/www/html/",
    "category": "File & Directory",
    "tags": [
      "sync"
    ]
  },
  {
    "id": "scp",
    "name": "scp",
    "explanation": "Secure copy over SSH",
    "pattern": "scp [-r] src dst",
    "example": "scp -r logs/ user@bastion:/tmp/incident/",
    "category": "File & Directory",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "sftp",
    "name": "sftp",
    "explanation": "Interactive SFTP session",
    "pattern": "sftp user@host",
    "example": "sftp deploy@prod",
    "category": "File & Directory",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "cpio",
    "name": "cpio",
    "explanation": "Archive files to cpio stream",
    "pattern": "cpio -o < list",
    "example": "find . -name '*.conf' | cpio -o > configs.cpio",
    "category": "File & Directory",
    "tags": [
      "archive"
    ]
  },
  {
    "id": "dd",
    "name": "dd",
    "explanation": "Low-level copy and convert",
    "pattern": "dd if= of= bs= count=",
    "example": "dd if=/dev/zero of=bench bs=1M count=1024 oflag=direct",
    "category": "File & Directory",
    "tags": [
      "io"
    ]
  },
  {
    "id": "df",
    "name": "df",
    "explanation": "Show filesystem disk usage",
    "pattern": "df -hT [path]",
    "example": "df -hT /var",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "du",
    "name": "du",
    "explanation": "Summarize directory disk usage",
    "pattern": "du -sh path",
    "example": "du -sh /var/log/* | sort -hr | head",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "mount",
    "name": "mount",
    "explanation": "Mount a filesystem",
    "pattern": "mount device mountpoint",
    "example": "mount /dev/nvme0n1p1 /mnt/recovery",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "umount",
    "name": "umount",
    "explanation": "Unmount filesystem",
    "pattern": "umount path",
    "example": "umount /mnt/recovery",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "findmnt",
    "name": "findmnt",
    "explanation": "List mounted filesystems",
    "pattern": "findmnt [path]",
    "example": "findmnt /var/lib/docker",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "lsblk",
    "name": "lsblk",
    "explanation": "List block devices",
    "pattern": "lsblk -f",
    "example": "lsblk -f",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "blkid",
    "name": "blkid",
    "explanation": "Print block device attributes",
    "pattern": "blkid",
    "example": "blkid /dev/sda1",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "fdisk",
    "name": "fdisk",
    "explanation": "Partition table editor",
    "pattern": "fdisk -l device",
    "example": "fdisk -l /dev/vda",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "parted",
    "name": "parted",
    "explanation": "Advanced partition tool",
    "pattern": "parted device print",
    "example": "parted /dev/sdb print",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "mkfs-ext4",
    "name": "mkfs.ext4",
    "explanation": "Create ext4 filesystem",
    "pattern": "mkfs.ext4 device",
    "example": "mkfs.ext4 -L data /dev/sdb1",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "fsck",
    "name": "fsck",
    "explanation": "Check and repair filesystem",
    "pattern": "fsck -f device",
    "example": "fsck -f /dev/sda1",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "tune2fs",
    "name": "tune2fs",
    "explanation": "Adjust ext filesystem params",
    "pattern": "tune2fs -l device",
    "example": "tune2fs -l /dev/sda1",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "xfs-repair",
    "name": "xfs_repair",
    "explanation": "Repair XFS filesystem",
    "pattern": "xfs_repair device",
    "example": "xfs_repair /dev/mapper/vg-data",
    "category": "Disk & Filesystem",
    "tags": [
      "storage"
    ]
  },
  {
    "id": "swapon",
    "name": "swapon",
    "explanation": "Enable swap space",
    "pattern": "swapon -a",
    "example": "swapon -a",
    "category": "Disk & Filesystem",
    "tags": [
      "memory"
    ]
  },
  {
    "id": "swapoff",
    "name": "swapoff",
    "explanation": "Disable swap device",
    "pattern": "swapoff -a",
    "example": "swapoff /dev/sda2",
    "category": "Disk & Filesystem",
    "tags": [
      "memory"
    ]
  },
  {
    "id": "free",
    "name": "free",
    "explanation": "Show memory and swap usage",
    "pattern": "free -h",
    "example": "free -h",
    "category": "System Information",
    "tags": [
      "memory"
    ]
  },
  {
    "id": "grep",
    "name": "grep",
    "explanation": "Search text with patterns",
    "pattern": "grep [options] pattern [file]",
    "example": "grep -RIn 'ERROR' /var/log/app",
    "category": "Text Processing",
    "tags": [
      "search"
    ]
  },
  {
    "id": "egrep",
    "name": "egrep",
    "explanation": "Extended regex grep",
    "pattern": "egrep pattern file",
    "example": "egrep -H 'timeout|refused' *.log",
    "category": "Text Processing",
    "aliases": [
      "grep -E"
    ],
    "tags": [
      "search"
    ]
  },
  {
    "id": "fgrep",
    "name": "fgrep",
    "explanation": "Fixed-string grep",
    "pattern": "fgrep string file",
    "example": "fgrep -F '[$special' app.log",
    "category": "Text Processing",
    "aliases": [
      "grep -F"
    ],
    "tags": [
      "search"
    ]
  },
  {
    "id": "ripgrep",
    "name": "rg",
    "explanation": "Fast recursive search",
    "pattern": "rg pattern path",
    "example": "rg -n --glob '!node_modules' 'TODO' .",
    "category": "Text Processing",
    "tags": [
      "search"
    ]
  },
  {
    "id": "sed",
    "name": "sed",
    "explanation": "Stream editor for text transforms",
    "pattern": "sed 'script' file",
    "example": "sed -i.bak 's/debug/info/g' app.conf",
    "category": "Text Processing",
    "tags": [
      "edit"
    ]
  },
  {
    "id": "awk",
    "name": "awk",
    "explanation": "Pattern scanning and reporting",
    "pattern": "awk 'program' file",
    "example": "awk '{print $1,$NF}' access.log | sort | uniq -c | sort -nr | head",
    "category": "Text Processing",
    "tags": [
      "analytics"
    ]
  },
  {
    "id": "cut",
    "name": "cut",
    "explanation": "Extract columns from lines",
    "pattern": "cut -d DELIM -f fields",
    "example": "cut -d' ' -f1,9 access.log",
    "category": "Text Processing",
    "tags": [
      "columns"
    ]
  },
  {
    "id": "sort",
    "name": "sort",
    "explanation": "Sort lines of text",
    "pattern": "sort [options] file",
    "example": "sort -t, -k2 -nr metrics.csv",
    "category": "Text Processing",
    "tags": [
      "sort"
    ]
  },
  {
    "id": "uniq",
    "name": "uniq",
    "explanation": "Filter adjacent duplicate lines",
    "pattern": "uniq [-c] file",
    "example": "sort access.log | uniq -c | sort -nr",
    "category": "Text Processing",
    "tags": [
      "aggregate"
    ]
  },
  {
    "id": "wc",
    "name": "wc",
    "explanation": "Count lines, words, bytes",
    "pattern": "wc -l file",
    "example": "wc -l /var/log/syslog",
    "category": "Text Processing",
    "tags": [
      "count"
    ]
  },
  {
    "id": "head",
    "name": "head",
    "explanation": "Output first lines",
    "pattern": "head -n N file",
    "example": "head -n 200 error.log",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "tail",
    "name": "tail",
    "explanation": "Output last lines",
    "pattern": "tail -n N file",
    "example": "tail -n 500 -f /var/log/nginx/error.log",
    "category": "Text Processing",
    "tags": [
      "logs"
    ]
  },
  {
    "id": "less",
    "name": "less",
    "explanation": "Pager for file viewing",
    "pattern": "less file",
    "example": "less +G /var/log/kern.log",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "more",
    "name": "more",
    "explanation": "Simple forward pager",
    "pattern": "more file",
    "example": "more README.md",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "cat",
    "name": "cat",
    "explanation": "Concatenate and print files",
    "pattern": "cat file",
    "example": "cat /etc/os-release",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "tac",
    "name": "tac",
    "explanation": "Concatenate files in reverse",
    "pattern": "tac file",
    "example": "tac sorted.txt",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "nl",
    "name": "nl",
    "explanation": "Number lines in file",
    "pattern": "nl file",
    "example": "nl -ba script.sh",
    "category": "Text Processing",
    "tags": [
      "view"
    ]
  },
  {
    "id": "od",
    "name": "od",
    "explanation": "Octal dump file bytes",
    "pattern": "od -Ax -tx1 file",
    "example": "od -Ax -tx1c /bin/sh | head",
    "category": "Text Processing",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "hexdump",
    "name": "hexdump",
    "explanation": "Hex dump file",
    "pattern": "hexdump -C file",
    "example": "hexdump -C payload.bin | head",
    "category": "Text Processing",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "strings",
    "name": "strings",
    "explanation": "Extract printable strings",
    "pattern": "strings file",
    "example": "strings /usr/bin/mystery | head",
    "category": "Text Processing",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "tr",
    "name": "tr",
    "explanation": "Translate or delete characters",
    "pattern": "tr set1 set2",
    "example": "tr -d '\\r' < windows.csv > unix.csv",
    "category": "Text Processing",
    "tags": [
      "transform"
    ]
  },
  {
    "id": "paste",
    "name": "paste",
    "explanation": "Merge lines side by side",
    "pattern": "paste file1 file2",
    "example": "paste hosts.tsv ips.tsv",
    "category": "Text Processing",
    "tags": [
      "columns"
    ]
  },
  {
    "id": "join",
    "name": "join",
    "explanation": "Join lines on common field",
    "pattern": "join -t, file1 file2",
    "example": "join -t, -1 1 users.csv logins.csv",
    "category": "Text Processing",
    "tags": [
      "analytics"
    ]
  },
  {
    "id": "comm",
    "name": "comm",
    "explanation": "Compare sorted files line-wise",
    "pattern": "comm -12 a b",
    "example": "comm -23 allowed.txt active.txt",
    "category": "Text Processing",
    "tags": [
      "compare"
    ]
  },
  {
    "id": "diff",
    "name": "diff",
    "explanation": "Compare files line by line",
    "pattern": "diff -u a b",
    "example": "diff -u nginx.conf nginx.conf.new",
    "category": "Text Processing",
    "tags": [
      "compare"
    ]
  },
  {
    "id": "sdiff",
    "name": "sdiff",
    "explanation": "Side-by-side diff",
    "pattern": "sdiff a b",
    "example": "sdiff prod.conf staging.conf",
    "category": "Text Processing",
    "tags": [
      "compare"
    ]
  },
  {
    "id": "patch",
    "name": "patch",
    "explanation": "Apply unified diff patch",
    "pattern": "patch -p0 < file.patch",
    "example": "patch -p1 < security-fix.patch",
    "category": "Text Processing",
    "tags": [
      "deploy"
    ]
  },
  {
    "id": "colrm",
    "name": "colrm",
    "explanation": "Remove character columns",
    "pattern": "colrm start end",
    "example": "df -h | colrm 1 10",
    "category": "Text Processing",
    "tags": [
      "columns"
    ]
  },
  {
    "id": "expand",
    "name": "expand",
    "explanation": "Tabs to spaces",
    "pattern": "expand -t 4 file",
    "example": "expand -t 2 Makefile",
    "category": "Text Processing",
    "tags": [
      "format"
    ]
  },
  {
    "id": "unexpand",
    "name": "unexpand",
    "explanation": "Spaces to tabs",
    "pattern": "unexpand file",
    "example": "unexpand -a indented.txt",
    "category": "Text Processing",
    "tags": [
      "format"
    ]
  },
  {
    "id": "fmt",
    "name": "fmt",
    "explanation": "Simple text reflow",
    "pattern": "fmt -w width file",
    "example": "fmt -w 100 report.txt",
    "category": "Text Processing",
    "tags": [
      "format"
    ]
  },
  {
    "id": "fold",
    "name": "fold",
    "explanation": "Wrap long input lines",
    "pattern": "fold -w N file",
    "example": "fold -w 120 wide.log",
    "category": "Text Processing",
    "tags": [
      "format"
    ]
  },
  {
    "id": "pr",
    "name": "pr",
    "explanation": "Paginate text for printing",
    "pattern": "pr -l 60 file",
    "example": "pr -2 changelog.md",
    "category": "Text Processing",
    "tags": [
      "format"
    ]
  },
  {
    "id": "tee",
    "name": "tee",
    "explanation": "Copy stdin to files and stdout",
    "pattern": "cmd | tee file",
    "example": "kubectl logs deploy/api | tee /tmp/api.log",
    "category": "Text Processing",
    "tags": [
      "pipe"
    ]
  },
  {
    "id": "sponge",
    "name": "sponge",
    "explanation": "Soak stdin before writing file",
    "pattern": "cmd | sponge file",
    "example": "grep -v '^#' app.conf | sponge app.conf",
    "category": "Text Processing",
    "tags": [
      "edit"
    ]
  },
  {
    "id": "xargs",
    "name": "xargs",
    "explanation": "Build and execute command lines",
    "pattern": "find ... | xargs cmd",
    "example": "find /tmp -type f -mtime +7 -print0 | xargs -0 rm -f",
    "category": "Search & Find",
    "tags": [
      "batch"
    ]
  },
  {
    "id": "parallel",
    "name": "parallel",
    "explanation": "Run jobs in parallel",
    "pattern": "parallel cmd ::: args",
    "example": "ls *.gz | parallel -j4 gzip -t -d {}",
    "category": "Scheduling & Automation",
    "tags": [
      "parallel"
    ]
  },
  {
    "id": "find",
    "name": "find",
    "explanation": "Search directory hierarchy",
    "pattern": "find path tests -exec cmd",
    "example": "find /var/log -name '*.log' -size +100M",
    "category": "Search & Find",
    "tags": [
      "search"
    ]
  },
  {
    "id": "locate",
    "name": "locate",
    "explanation": "Quick filename search via mlocate DB",
    "pattern": "locate pattern",
    "example": "locate -b '\\nginx.conf'",
    "category": "Search & Find",
    "tags": [
      "search"
    ]
  },
  {
    "id": "updatedb",
    "name": "updatedb",
    "explanation": "Refresh locate database",
    "pattern": "updatedb",
    "example": "sudo updatedb",
    "category": "Search & Find",
    "tags": [
      "search"
    ]
  },
  {
    "id": "which",
    "name": "which",
    "explanation": "Locate executable in PATH",
    "pattern": "which cmd",
    "example": "which python3",
    "category": "Search & Find",
    "tags": [
      "path"
    ]
  },
  {
    "id": "whereis",
    "name": "whereis",
    "explanation": "Locate binary, source, man",
    "pattern": "whereis nginx",
    "example": "whereis -b nginx",
    "category": "Search & Find",
    "tags": [
      "path"
    ]
  },
  {
    "id": "type",
    "name": "type",
    "explanation": "Show command type in shell",
    "pattern": "type cmd",
    "example": "type -a python",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "ps",
    "name": "ps",
    "explanation": "Report process snapshot",
    "pattern": "ps aux",
    "example": "ps aux --sort=-%mem | head",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "top",
    "name": "top",
    "explanation": "Interactive process viewer",
    "pattern": "top",
    "example": "top -o %CPU",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "htop",
    "name": "htop",
    "explanation": "Enhanced interactive process viewer",
    "pattern": "htop",
    "example": "htop -u www-data",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "pgrep",
    "name": "pgrep",
    "explanation": "Find PIDs by name",
    "pattern": "pgrep -af pattern",
    "example": "pgrep -af 'java.*app.jar'",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "pkill",
    "name": "pkill",
    "explanation": "Signal processes by name",
    "pattern": "pkill -f pattern",
    "example": "pkill -HUP nginx",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "kill",
    "name": "kill",
    "explanation": "Send signal to PID",
    "pattern": "kill -SIG PID",
    "example": "kill -TERM 4242",
    "category": "Process Management",
    "tags": [
      "signals"
    ]
  },
  {
    "id": "killall",
    "name": "killall",
    "explanation": "Kill processes by name",
    "pattern": "killall name",
    "example": "killall -HUP php-fpm",
    "category": "Process Management",
    "tags": [
      "signals"
    ]
  },
  {
    "id": "nice",
    "name": "nice",
    "explanation": "Run with altered priority",
    "pattern": "nice -n N cmd",
    "example": "nice -n 10 gzip huge.tar",
    "category": "Process Management",
    "tags": [
      "priority"
    ]
  },
  {
    "id": "renice",
    "name": "renice",
    "explanation": "Change priority of running PID",
    "pattern": "renice -n N -p pid",
    "example": "renice -n -5 -p $(pgrep mysqld)",
    "category": "Process Management",
    "tags": [
      "priority"
    ]
  },
  {
    "id": "nohup",
    "name": "nohup",
    "explanation": "Run immune to hangups",
    "pattern": "nohup cmd &",
    "example": "nohup ./long-job.sh > job.out 2>&1 &",
    "category": "Process Management",
    "tags": [
      "background"
    ]
  },
  {
    "id": "bg",
    "name": "bg",
    "explanation": "Resume job in background",
    "pattern": "bg %job",
    "example": "bg %1",
    "category": "Shell Builtins",
    "tags": [
      "jobs"
    ]
  },
  {
    "id": "fg",
    "name": "fg",
    "explanation": "Bring job to foreground",
    "pattern": "fg %job",
    "example": "fg %2",
    "category": "Shell Builtins",
    "tags": [
      "jobs"
    ]
  },
  {
    "id": "jobs",
    "name": "jobs",
    "explanation": "List active shell jobs",
    "pattern": "jobs -l",
    "example": "jobs -l",
    "category": "Shell Builtins",
    "tags": [
      "jobs"
    ]
  },
  {
    "id": "disown",
    "name": "disown",
    "explanation": "Remove job from shell table",
    "pattern": "disown -h %job",
    "example": "disown -h %1",
    "category": "Shell Builtins",
    "tags": [
      "jobs"
    ]
  },
  {
    "id": "wait",
    "name": "wait",
    "explanation": "Wait for background jobs",
    "pattern": "wait [pid]",
    "example": "wait $!",
    "category": "Shell Builtins",
    "tags": [
      "jobs"
    ]
  },
  {
    "id": "strace",
    "name": "strace",
    "explanation": "Trace system calls",
    "pattern": "strace -p pid",
    "example": "strace -f -e trace=network -p $(pgrep api)",
    "category": "Process Management",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "ltrace",
    "name": "ltrace",
    "explanation": "Trace library calls",
    "pattern": "ltrace cmd",
    "example": "ltrace -f ./binary",
    "category": "Process Management",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "lsof",
    "name": "lsof",
    "explanation": "List open files and sockets",
    "pattern": "lsof -i :port",
    "example": "lsof -iTCP:443 -sTCP:LISTEN",
    "category": "Process Management",
    "tags": [
      "network"
    ]
  },
  {
    "id": "fuser-kill",
    "name": "fuser",
    "explanation": "Kill processes on socket/file",
    "pattern": "fuser -k 8080/tcp",
    "example": "fuser -k 8080/tcp",
    "category": "Process Management",
    "tags": [
      "network"
    ]
  },
  {
    "id": "timeout",
    "name": "timeout",
    "explanation": "Run command with time limit",
    "pattern": "timeout DURATION cmd",
    "example": "timeout 30s curl -v http://localhost/health",
    "category": "Process Management",
    "tags": [
      "reliability"
    ]
  },
  {
    "id": "watch",
    "name": "watch",
    "explanation": "Execute periodically",
    "pattern": "watch -n sec cmd",
    "example": "watch -n 2 'ss -s'",
    "category": "Monitoring & Logs",
    "tags": [
      "monitor"
    ]
  },
  {
    "id": "pidof",
    "name": "pidof",
    "explanation": "Find PIDs of program",
    "pattern": "pidof nginx",
    "example": "pidof -s nginx",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "pstree",
    "name": "pstree",
    "explanation": "Show process tree",
    "pattern": "pstree -p",
    "example": "pstree -ap $(pidof systemd)",
    "category": "Process Management",
    "tags": [
      "process"
    ]
  },
  {
    "id": "taskset",
    "name": "taskset",
    "explanation": "Set CPU affinity",
    "pattern": "taskset -c mask cmd",
    "example": "taskset -c 0-3 ./benchmark",
    "category": "Process Management",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "chown",
    "name": "chown",
    "explanation": "Change file owner and group",
    "pattern": "chown user:group file",
    "example": "chown -R deploy:deploy /srv/app",
    "category": "User & Permissions",
    "tags": [
      "permissions"
    ]
  },
  {
    "id": "chmod",
    "name": "chmod",
    "explanation": "Change file permission bits",
    "pattern": "chmod mode file",
    "example": "chmod 640 /etc/app/secrets.env",
    "category": "User & Permissions",
    "tags": [
      "permissions"
    ]
  },
  {
    "id": "chgrp",
    "name": "chgrp",
    "explanation": "Change group ownership",
    "pattern": "chgrp group file",
    "example": "chgrp www-data /var/www/html",
    "category": "User & Permissions",
    "tags": [
      "permissions"
    ]
  },
  {
    "id": "umask",
    "name": "umask",
    "explanation": "Set default permission mask",
    "pattern": "umask [mask]",
    "example": "umask 027",
    "category": "User & Permissions",
    "tags": [
      "permissions"
    ]
  },
  {
    "id": "id",
    "name": "id",
    "explanation": "Print user and group IDs",
    "pattern": "id [user]",
    "example": "id deploy",
    "category": "User & Permissions",
    "tags": [
      "identity"
    ]
  },
  {
    "id": "whoami",
    "name": "whoami",
    "explanation": "Print effective username",
    "pattern": "whoami",
    "example": "whoami",
    "category": "User & Permissions",
    "tags": [
      "identity"
    ]
  },
  {
    "id": "groups",
    "name": "groups",
    "explanation": "Print group memberships",
    "pattern": "groups [user]",
    "example": "groups svc-api",
    "category": "User & Permissions",
    "tags": [
      "identity"
    ]
  },
  {
    "id": "useradd",
    "name": "useradd",
    "explanation": "Create user account",
    "pattern": "useradd [options] user",
    "example": "useradd -m -s /bin/bash deploy",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "usermod",
    "name": "usermod",
    "explanation": "Modify user account",
    "pattern": "usermod [options] user",
    "example": "usermod -aG docker deploy",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "userdel",
    "name": "userdel",
    "explanation": "Delete user account",
    "pattern": "userdel user",
    "example": "userdel -r tempaudit",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "groupadd",
    "name": "groupadd",
    "explanation": "Create group",
    "pattern": "groupadd group",
    "example": "groupadd sre",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "groupmod",
    "name": "groupmod",
    "explanation": "Modify group",
    "pattern": "groupmod [options] group",
    "example": "groupmod -n sre-team sre",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "groupdel",
    "name": "groupdel",
    "explanation": "Delete group",
    "pattern": "groupdel group",
    "example": "groupdel legacy",
    "category": "User & Permissions",
    "tags": [
      "accounts"
    ]
  },
  {
    "id": "passwd",
    "name": "passwd",
    "explanation": "Change user password",
    "pattern": "passwd [user]",
    "example": "passwd svc-batch",
    "category": "User & Permissions",
    "tags": [
      "security"
    ]
  },
  {
    "id": "su",
    "name": "su",
    "explanation": "Switch user identity",
    "pattern": "su - user",
    "example": "su - postgres",
    "category": "User & Permissions",
    "tags": [
      "identity"
    ]
  },
  {
    "id": "sudo",
    "name": "sudo",
    "explanation": "Execute as superuser",
    "pattern": "sudo cmd",
    "example": "sudo -u www-data nginx -t",
    "category": "User & Permissions",
    "tags": [
      "privilege"
    ]
  },
  {
    "id": "visudo",
    "name": "visudo",
    "explanation": "Safely edit sudoers file",
    "pattern": "visudo",
    "example": "visudo",
    "category": "User & Permissions",
    "tags": [
      "security"
    ]
  },
  {
    "id": "getent",
    "name": "getent",
    "explanation": "Query NSS databases",
    "pattern": "getent passwd user",
    "example": "getent group docker",
    "category": "User & Permissions",
    "tags": [
      "ldap"
    ]
  },
  {
    "id": "last",
    "name": "last",
    "explanation": "Show login history",
    "pattern": "last [-n]",
    "example": "last -20 deploy",
    "category": "User & Permissions",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "lastlog",
    "name": "lastlog",
    "explanation": "Report last login times",
    "pattern": "lastlog",
    "example": "lastlog | grep -v '**Never'",
    "category": "User & Permissions",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "w",
    "name": "w",
    "explanation": "Show logged-in users and load",
    "pattern": "w",
    "example": "w",
    "category": "User & Permissions",
    "tags": [
      "session"
    ]
  },
  {
    "id": "who",
    "name": "who",
    "explanation": "Show who is logged on",
    "pattern": "who -a",
    "example": "who -a",
    "category": "User & Permissions",
    "tags": [
      "session"
    ]
  },
  {
    "id": "uptime",
    "name": "uptime",
    "explanation": "Show uptime and load averages",
    "pattern": "uptime",
    "example": "uptime",
    "category": "System Information",
    "tags": [
      "load"
    ]
  },
  {
    "id": "uname",
    "name": "uname",
    "explanation": "Print kernel information",
    "pattern": "uname -a",
    "example": "uname -r",
    "category": "System Information",
    "tags": [
      "kernel"
    ]
  },
  {
    "id": "hostname",
    "name": "hostname",
    "explanation": "Show or set system hostname",
    "pattern": "hostname",
    "example": "hostname -f",
    "category": "System Information",
    "tags": [
      "network"
    ]
  },
  {
    "id": "hostnamectl",
    "name": "hostnamectl",
    "explanation": "Control hostname on systemd",
    "pattern": "hostnamectl",
    "example": "hostnamectl set-hostname api-01",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "timedatectl",
    "name": "timedatectl",
    "explanation": "Control time and timezone",
    "pattern": "timedatectl",
    "example": "timedatectl set-timezone UTC",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "lscpu",
    "name": "lscpu",
    "explanation": "Display CPU architecture info",
    "pattern": "lscpu",
    "example": "lscpu",
    "category": "System Information",
    "tags": [
      "hardware"
    ]
  },
  {
    "id": "lsmem",
    "name": "lsmem",
    "explanation": "List memory ranges",
    "pattern": "lsmem",
    "example": "lsmem",
    "category": "System Information",
    "tags": [
      "hardware"
    ]
  },
  {
    "id": "dmidecode",
    "name": "dmidecode",
    "explanation": "DMI hardware table decoder",
    "pattern": "dmidecode -t memory",
    "example": "dmidecode -t system",
    "category": "System Information",
    "tags": [
      "hardware"
    ]
  },
  {
    "id": "lspci",
    "name": "lspci",
    "explanation": "List PCI devices",
    "pattern": "lspci -nn",
    "example": "lspci -nnk",
    "category": "System Information",
    "tags": [
      "hardware"
    ]
  },
  {
    "id": "lsusb",
    "name": "lsusb",
    "explanation": "List USB devices",
    "pattern": "lsusb",
    "example": "lsusb -t",
    "category": "System Information",
    "tags": [
      "hardware"
    ]
  },
  {
    "id": "dmesg",
    "name": "dmesg",
    "explanation": "Print kernel ring buffer",
    "pattern": "dmesg -T",
    "example": "dmesg -T | tail -50",
    "category": "System Information",
    "tags": [
      "kernel"
    ]
  },
  {
    "id": "journalctl",
    "name": "journalctl",
    "explanation": "Query systemd journal logs",
    "pattern": "journalctl [options]",
    "example": "journalctl -u nginx -S today --no-pager",
    "category": "Monitoring & Logs",
    "tags": [
      "logs"
    ]
  },
  {
    "id": "logger",
    "name": "logger",
    "explanation": "Write to system log",
    "pattern": "logger message",
    "example": "logger -t deploy 'release v2.3 complete'",
    "category": "Monitoring & Logs",
    "tags": [
      "logs"
    ]
  },
  {
    "id": "logrotate",
    "name": "logrotate",
    "explanation": "Rotate log files per policy",
    "pattern": "logrotate -f /etc/logrotate.conf",
    "example": "logrotate -f /etc/logrotate.d/nginx",
    "category": "Monitoring & Logs",
    "tags": [
      "logs"
    ]
  },
  {
    "id": "tailscale",
    "name": "tailscale",
    "explanation": "Manage Tailscale VPN",
    "pattern": "tailscale status",
    "example": "tailscale status",
    "category": "Networking",
    "tags": [
      "vpn"
    ]
  },
  {
    "id": "ping",
    "name": "ping",
    "explanation": "Test ICMP reachability",
    "pattern": "ping host",
    "example": "ping -c 4 gateway.internal",
    "category": "Networking",
    "tags": [
      "diagnostics"
    ]
  },
  {
    "id": "traceroute",
    "name": "traceroute",
    "explanation": "Trace route to host",
    "pattern": "traceroute host",
    "example": "traceroute -n 8.8.8.8",
    "category": "Networking",
    "tags": [
      "diagnostics"
    ]
  },
  {
    "id": "tracepath",
    "name": "tracepath",
    "explanation": "Discover network path MTU",
    "pattern": "tracepath host",
    "example": "tracepath api.example.com",
    "category": "Networking",
    "tags": [
      "diagnostics"
    ]
  },
  {
    "id": "mtr",
    "name": "mtr",
    "explanation": "Combined ping and traceroute",
    "pattern": "mtr host",
    "example": "mtr -rwzc 50 db.internal",
    "category": "Networking",
    "tags": [
      "diagnostics"
    ]
  },
  {
    "id": "curl",
    "name": "curl",
    "explanation": "Transfer data from URLs",
    "pattern": "curl [options] URL",
    "example": "curl -fsSL -o /tmp/script.sh https://example/install.sh",
    "category": "Networking",
    "tags": [
      "http"
    ]
  },
  {
    "id": "wget",
    "name": "wget",
    "explanation": "Non-interactive network downloader",
    "pattern": "wget URL",
    "example": "wget -qO- http://169.254.169.254/latest/meta-data/",
    "category": "Networking",
    "tags": [
      "http"
    ]
  },
  {
    "id": "dig",
    "name": "dig",
    "explanation": "DNS lookup utility",
    "pattern": "dig name [type]",
    "example": "dig +short A api.example.com @1.1.1.1",
    "category": "Networking",
    "tags": [
      "dns"
    ]
  },
  {
    "id": "nslookup",
    "name": "nslookup",
    "explanation": "Interactive DNS query",
    "pattern": "nslookup name",
    "example": "nslookup -type=TXT _dmarc.example.com",
    "category": "Networking",
    "tags": [
      "dns"
    ]
  },
  {
    "id": "host",
    "name": "host",
    "explanation": "DNS lookup utility",
    "pattern": "host name",
    "example": "host -t MX example.com",
    "category": "Networking",
    "tags": [
      "dns"
    ]
  },
  {
    "id": "whois",
    "name": "whois",
    "explanation": "Query WHOIS registry",
    "pattern": "whois domain",
    "example": "whois suspicious-domain.biz",
    "category": "Networking",
    "tags": [
      "security"
    ]
  },
  {
    "id": "ss",
    "name": "ss",
    "explanation": "Socket statistics",
    "pattern": "ss -tulpn",
    "example": "ss -tulpn | grep ':443'",
    "category": "Networking",
    "tags": [
      "sockets"
    ]
  },
  {
    "id": "netstat",
    "name": "netstat",
    "explanation": "Network connections and stats",
    "pattern": "netstat -tulpn",
    "example": "netstat -plant | grep ESTABLISHED",
    "category": "Networking",
    "tags": [
      "sockets"
    ]
  },
  {
    "id": "ip",
    "name": "ip",
    "explanation": "Show or manipulate networking",
    "pattern": "ip [OBJECT] cmd",
    "example": "ip -br addr show",
    "category": "Networking",
    "tags": [
      "routing"
    ]
  },
  {
    "id": "ifconfig",
    "name": "ifconfig",
    "explanation": "Legacy interface configuration",
    "pattern": "ifconfig [iface]",
    "example": "ifconfig eth0",
    "category": "Networking",
    "aliases": [
      "ip addr"
    ],
    "tags": [
      "legacy"
    ]
  },
  {
    "id": "route",
    "name": "route",
    "explanation": "Show IP routing table",
    "pattern": "route -n",
    "example": "route -n",
    "category": "Networking",
    "aliases": [
      "ip route"
    ],
    "tags": [
      "routing"
    ]
  },
  {
    "id": "arp",
    "name": "arp",
    "explanation": "Manage ARP cache",
    "pattern": "arp -n",
    "example": "arp -n | grep incomplete",
    "category": "Networking",
    "tags": [
      "layer2"
    ]
  },
  {
    "id": "iptables",
    "name": "iptables",
    "explanation": "IPv4 packet filter rules",
    "pattern": "iptables -L -n -v",
    "example": "iptables -L INPUT -n -v --line-numbers",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "iptables-save",
    "name": "iptables-save",
    "explanation": "Dump iptables rules",
    "pattern": "iptables-save",
    "example": "iptables-save > /root/iptables.backup",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "iptables-restore",
    "name": "iptables-restore",
    "explanation": "Restore iptables rules",
    "pattern": "iptables-restore < file",
    "example": "iptables-restore < /root/iptables.backup",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "nft",
    "name": "nft",
    "explanation": "Manage nftables ruleset",
    "pattern": "nft list ruleset",
    "example": "nft list ruleset | less",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "ufw",
    "name": "ufw",
    "explanation": "Uncomplicated firewall",
    "pattern": "ufw status verbose",
    "example": "ufw allow 443/tcp",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "firewall-cmd",
    "name": "firewall-cmd",
    "explanation": "firewalld management",
    "pattern": "firewall-cmd --list-all",
    "example": "firewall-cmd --add-service=https --permanent",
    "category": "Security",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "tcpdump",
    "name": "tcpdump",
    "explanation": "Capture network packets",
    "pattern": "tcpdump -i iface filter",
    "example": "tcpdump -i any -nn port 5432 and host db01",
    "category": "Networking",
    "tags": [
      "capture"
    ]
  },
  {
    "id": "nc",
    "name": "nc",
    "explanation": "Netcat for TCP/UDP connections",
    "pattern": "nc host port",
    "example": "nc -zv db.internal 5432",
    "category": "Networking",
    "aliases": [
      "netcat"
    ],
    "tags": [
      "diagnostics"
    ]
  },
  {
    "id": "nmap",
    "name": "nmap",
    "explanation": "Network discovery and port scan",
    "pattern": "nmap options host",
    "example": "nmap -sV -p 1-1024 staging.internal",
    "category": "Security",
    "tags": [
      "scan"
    ]
  },
  {
    "id": "openssl-s_client",
    "name": "openssl s_client",
    "explanation": "Test TLS handshake",
    "pattern": "openssl s_client -connect host:443",
    "example": "openssl s_client -connect api:443 -servername api",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "ssh",
    "name": "ssh",
    "explanation": "Secure shell remote login",
    "pattern": "ssh user@host",
    "example": "ssh -J bastion deploy@app.internal",
    "category": "Networking",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "ssh-keygen",
    "name": "ssh-keygen",
    "explanation": "Generate SSH key pairs",
    "pattern": "ssh-keygen -t ed25519",
    "example": "ssh-keygen -t ed25519 -C 'ci-deploy' -f deploy_key",
    "category": "Security",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "ssh-copy-id",
    "name": "ssh-copy-id",
    "explanation": "Install public key on server",
    "pattern": "ssh-copy-id user@host",
    "example": "ssh-copy-id -i deploy_key.pub deploy@app",
    "category": "Security",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "ssh-agent",
    "name": "ssh-agent",
    "explanation": "Hold private keys for sessions",
    "pattern": "eval $(ssh-agent)",
    "example": "eval $(ssh-agent -s) && ssh-add deploy_key",
    "category": "Security",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "scp-secure",
    "name": "scp",
    "explanation": "Copy files over SSH",
    "pattern": "scp file user@host:path",
    "example": "scp -i key.pem bundle.tar.gz ec2-user@host:/tmp/",
    "category": "Networking",
    "tags": [
      "ssh"
    ]
  },
  {
    "id": "rsync-ssh",
    "name": "rsync",
    "explanation": "Sync over SSH transport",
    "pattern": "rsync -e ssh src dst",
    "example": "rsync -avz -e 'ssh -i key.pem' ./app/ user@host:/opt/app/",
    "category": "Networking",
    "tags": [
      "sync"
    ]
  },
  {
    "id": "tar",
    "name": "tar",
    "explanation": "Archive files",
    "pattern": "tar [options] archive files",
    "example": "tar -czf backup.tgz /etc/nginx",
    "category": "Archives & Compression",
    "tags": [
      "archive"
    ]
  },
  {
    "id": "gzip",
    "name": "gzip",
    "explanation": "Compress files with gzip",
    "pattern": "gzip file",
    "example": "gzip -9 access.log.old",
    "category": "Archives & Compression",
    "tags": [
      "compress"
    ]
  },
  {
    "id": "gunzip",
    "name": "gunzip",
    "explanation": "Decompress gzip files",
    "pattern": "gunzip file.gz",
    "example": "gunzip access.log.gz",
    "category": "Archives & Compression",
    "tags": [
      "compress"
    ]
  },
  {
    "id": "bzip2",
    "name": "bzip2",
    "explanation": "Compress with bzip2",
    "pattern": "bzip2 file",
    "example": "bzip2 large.dump",
    "category": "Archives & Compression",
    "tags": [
      "compress"
    ]
  },
  {
    "id": "xz",
    "name": "xz",
    "explanation": "Compress with xz",
    "pattern": "xz file",
    "example": "xz -9 image.raw",
    "category": "Archives & Compression",
    "tags": [
      "compress"
    ]
  },
  {
    "id": "unzip",
    "name": "unzip",
    "explanation": "Extract ZIP archives",
    "pattern": "unzip file.zip",
    "example": "unzip -l artifacts.zip",
    "category": "Archives & Compression",
    "tags": [
      "archive"
    ]
  },
  {
    "id": "zip",
    "name": "zip",
    "explanation": "Create ZIP archive",
    "pattern": "zip -r out.zip dir",
    "example": "zip -r configs.zip /etc/app/*.conf",
    "category": "Archives & Compression",
    "tags": [
      "archive"
    ]
  },
  {
    "id": "zstd",
    "name": "zstd",
    "explanation": "Compress with Zstandard",
    "pattern": "zstd file",
    "example": "zstd -19 metrics.json",
    "category": "Archives & Compression",
    "tags": [
      "compress"
    ]
  },
  {
    "id": "7z",
    "name": "7z",
    "explanation": "7-Zip archiver",
    "pattern": "7z x archive",
    "example": "7z x release.7z",
    "category": "Archives & Compression",
    "tags": [
      "archive"
    ]
  },
  {
    "id": "apt",
    "name": "apt",
    "explanation": "Debian package manager",
    "pattern": "apt [subcommand]",
    "example": "apt update && apt install -y jq",
    "category": "Package Management",
    "tags": [
      "debian"
    ]
  },
  {
    "id": "apt-get",
    "name": "apt-get",
    "explanation": "Lower-level APT interface",
    "pattern": "apt-get install pkg",
    "example": "apt-get install -y --no-install-recommends build-essential",
    "category": "Package Management",
    "tags": [
      "debian"
    ]
  },
  {
    "id": "dpkg",
    "name": "dpkg",
    "explanation": "Debian package manager low-level",
    "pattern": "dpkg -i pkg.deb",
    "example": "dpkg -i custom-agent.deb",
    "category": "Package Management",
    "tags": [
      "debian"
    ]
  },
  {
    "id": "yum",
    "name": "yum",
    "explanation": "RHEL package manager (legacy)",
    "pattern": "yum install pkg",
    "example": "yum install -y bind-utils",
    "category": "Package Management",
    "tags": [
      "rhel"
    ]
  },
  {
    "id": "dnf",
    "name": "dnf",
    "explanation": "Fedora/RHEL package manager",
    "pattern": "dnf install pkg",
    "example": "dnf install -y policycoreutils-python-utils",
    "category": "Package Management",
    "tags": [
      "rhel"
    ]
  },
  {
    "id": "rpm",
    "name": "rpm",
    "explanation": "RPM package manager",
    "pattern": "rpm -qa | grep pkg",
    "example": "rpm -qa --last | head",
    "category": "Package Management",
    "tags": [
      "rhel"
    ]
  },
  {
    "id": "pacman",
    "name": "pacman",
    "explanation": "Arch Linux package manager",
    "pattern": "pacman -S pkg",
    "example": "pacman -Syu nginx",
    "category": "Package Management",
    "tags": [
      "arch"
    ]
  },
  {
    "id": "brew",
    "name": "brew",
    "explanation": "macOS Homebrew package manager",
    "pattern": "brew install formula",
    "example": "brew install jq yq",
    "category": "Package Management",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "snap",
    "name": "snap",
    "explanation": "Universal snap packages",
    "pattern": "snap install pkg",
    "example": "snap install kubectl --classic",
    "category": "Package Management",
    "tags": [
      "linux"
    ]
  },
  {
    "id": "flatpak",
    "name": "flatpak",
    "explanation": "Flatpak application manager",
    "pattern": "flatpak install app",
    "example": "flatpak update",
    "category": "Package Management",
    "tags": [
      "linux"
    ]
  },
  {
    "id": "pip",
    "name": "pip",
    "explanation": "Install Python packages",
    "pattern": "pip install pkg",
    "example": "pip install -r requirements.txt",
    "category": "Development Tools",
    "tags": [
      "python"
    ]
  },
  {
    "id": "npm",
    "name": "npm",
    "explanation": "Node package manager",
    "pattern": "npm install pkg",
    "example": "npm ci --omit=dev",
    "category": "Development Tools",
    "tags": [
      "node"
    ]
  },
  {
    "id": "yarn",
    "name": "yarn",
    "explanation": "Yarn Node package manager",
    "pattern": "yarn add pkg",
    "example": "yarn install --frozen-lockfile",
    "category": "Development Tools",
    "tags": [
      "node"
    ]
  },
  {
    "id": "pnpm",
    "name": "pnpm",
    "explanation": "Fast Node package manager",
    "pattern": "pnpm install",
    "example": "pnpm install --frozen-lockfile",
    "category": "Development Tools",
    "tags": [
      "node"
    ]
  },
  {
    "id": "make",
    "name": "make",
    "explanation": "GNU make build automation",
    "pattern": "make target",
    "example": "make -j$(nproc) test",
    "category": "Development Tools",
    "tags": [
      "build"
    ]
  },
  {
    "id": "cmake",
    "name": "cmake",
    "explanation": "Cross-platform build generator",
    "pattern": "cmake -S . -B build",
    "example": "cmake -S . -B build -DCMAKE_BUILD_TYPE=Release",
    "category": "Development Tools",
    "tags": [
      "build"
    ]
  },
  {
    "id": "gcc",
    "name": "gcc",
    "explanation": "GNU C compiler",
    "pattern": "gcc -o out src.c",
    "example": "gcc -O2 -Wall -o app main.c",
    "category": "Development Tools",
    "tags": [
      "compile"
    ]
  },
  {
    "id": "g++",
    "name": "g++",
    "explanation": "GNU C++ compiler",
    "pattern": "g++ -o out src.cpp",
    "example": "g++ -std=c++20 -O2 -o svc main.cpp",
    "category": "Development Tools",
    "tags": [
      "compile"
    ]
  },
  {
    "id": "clang",
    "name": "clang",
    "explanation": "LLVM C/C++ compiler",
    "pattern": "clang -o out src.c",
    "example": "clang -fsanitize=address -g -o app main.c",
    "category": "Development Tools",
    "tags": [
      "compile"
    ]
  },
  {
    "id": "ldd",
    "name": "ldd",
    "explanation": "Print shared library dependencies",
    "pattern": "ldd binary",
    "example": "ldd ./app | grep 'not found'",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "nm",
    "name": "nm",
    "explanation": "List symbols in object files",
    "pattern": "nm binary",
    "example": "nm -D ./libapi.so | c++filt",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "objdump",
    "name": "objdump",
    "explanation": "Display object file info",
    "pattern": "objdump -d binary",
    "example": "objdump -d -M intel ./binary | less",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "readelf",
    "name": "readelf",
    "explanation": "Display ELF file structure",
    "pattern": "readelf -h binary",
    "example": "readelf -Ws ./app",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "gdb",
    "name": "gdb",
    "explanation": "GNU debugger",
    "pattern": "gdb program",
    "example": "gdb -p $(pgrep api) -batch -ex 'thread apply all bt'",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "valgrind",
    "name": "valgrind",
    "explanation": "Memory and threading debugger",
    "pattern": "valgrind tool program",
    "example": "valgrind --leak-check=full ./app",
    "category": "Development Tools",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "perf",
    "name": "perf",
    "explanation": "Linux performance counters",
    "pattern": "perf record cmd",
    "example": "perf record -g -p $(pgrep api) sleep 30",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "sar",
    "name": "sar",
    "explanation": "System activity reporter",
    "pattern": "sar -u 1 5",
    "example": "sar -n DEV 1 10",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "iostat",
    "name": "iostat",
    "explanation": "CPU and I/O statistics",
    "pattern": "iostat -xz 1",
    "example": "iostat -xm 1 5",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "vmstat",
    "name": "vmstat",
    "explanation": "Virtual memory statistics",
    "pattern": "vmstat 1",
    "example": "vmstat 1 10",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "mpstat",
    "name": "mpstat",
    "explanation": "Per-processor statistics",
    "pattern": "mpstat -P ALL 1",
    "example": "mpstat -P ALL 1 5",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "pidstat",
    "name": "pidstat",
    "explanation": "Per-process statistics",
    "pattern": "pidstat -d 1",
    "example": "pidstat -urd 1 -p $(pgrep java)",
    "category": "Monitoring & Logs",
    "tags": [
      "performance"
    ]
  },
  {
    "id": "crontab",
    "name": "crontab",
    "explanation": "Schedule periodic jobs",
    "pattern": "crontab -e",
    "example": "crontab -l -u deploy",
    "category": "Scheduling & Automation",
    "tags": [
      "cron"
    ]
  },
  {
    "id": "at",
    "name": "at",
    "explanation": "Schedule one-shot job",
    "pattern": "echo cmd | at time",
    "example": "echo './backup.sh' | at 02:00 tomorrow",
    "category": "Scheduling & Automation",
    "tags": [
      "schedule"
    ]
  },
  {
    "id": "systemctl",
    "name": "systemctl",
    "explanation": "Control systemd units",
    "pattern": "systemctl [cmd] unit",
    "example": "systemctl restart nginx && systemctl status nginx",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "journalctl-boot",
    "name": "journalctl",
    "explanation": "Show logs for current boot",
    "pattern": "journalctl -b",
    "example": "journalctl -b -p err..alert",
    "category": "Monitoring & Logs",
    "tags": [
      "logs"
    ]
  },
  {
    "id": "export",
    "name": "export",
    "explanation": "Mark shell variables for export",
    "pattern": "export VAR=value",
    "example": "export KUBECONFIG=~/.kube/prod",
    "category": "Environment & Variables",
    "tags": [
      "env"
    ]
  },
  {
    "id": "env",
    "name": "env",
    "explanation": "Run with modified environment",
    "pattern": "env VAR=val cmd",
    "example": "env -i HOME=$HOME PATH=$PATH bash -lc 'make test'",
    "category": "Environment & Variables",
    "tags": [
      "env"
    ]
  },
  {
    "id": "printenv",
    "name": "printenv",
    "explanation": "Print environment variables",
    "pattern": "printenv [VAR]",
    "example": "printenv DATABASE_URL",
    "category": "Environment & Variables",
    "tags": [
      "env"
    ]
  },
  {
    "id": "set",
    "name": "set",
    "explanation": "Display or set shell options",
    "pattern": "set -o pipefail",
    "example": "set -euo pipefail",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "unset",
    "name": "unset",
    "explanation": "Remove shell variables",
    "pattern": "unset VAR",
    "example": "unset AWS_SECRET_ACCESS_KEY",
    "category": "Environment & Variables",
    "tags": [
      "env"
    ]
  },
  {
    "id": "alias",
    "name": "alias",
    "explanation": "Define command alias",
    "pattern": "alias name=value",
    "example": "alias k='kubectl -n prod'",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "source",
    "name": "source",
    "explanation": "Execute commands from file",
    "pattern": "source file",
    "example": "source .venv/bin/activate",
    "category": "Shell Builtins",
    "aliases": [
      "."
    ],
    "tags": [
      "shell"
    ]
  },
  {
    "id": "exec",
    "name": "exec",
    "explanation": "Replace shell with command",
    "pattern": "exec cmd",
    "example": "exec sudo -u postgres psql",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "history",
    "name": "history",
    "explanation": "Show shell command history",
    "pattern": "history",
    "example": "history | tail -50",
    "category": "Terminal & Session",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "script",
    "name": "script",
    "explanation": "Record terminal session",
    "pattern": "script file",
    "example": "script -a /tmp/incident-$(date +%F).log",
    "category": "Terminal & Session",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "tmux",
    "name": "tmux",
    "explanation": "Terminal multiplexer",
    "pattern": "tmux new -s name",
    "example": "tmux attach -t deploy",
    "category": "Terminal & Session",
    "tags": [
      "session"
    ]
  },
  {
    "id": "screen",
    "name": "screen",
    "explanation": "GNU screen multiplexer",
    "pattern": "screen -S name",
    "example": "screen -r deploy",
    "category": "Terminal & Session",
    "tags": [
      "session"
    ]
  },
  {
    "id": "stty",
    "name": "stty",
    "explanation": "Change terminal line settings",
    "pattern": "stty -a",
    "example": "stty rows 50 cols 120",
    "category": "Terminal & Session",
    "tags": [
      "terminal"
    ]
  },
  {
    "id": "reset",
    "name": "reset",
    "explanation": "Reset terminal state",
    "pattern": "reset",
    "example": "reset",
    "category": "Terminal & Session",
    "tags": [
      "terminal"
    ]
  },
  {
    "id": "clear",
    "name": "clear",
    "explanation": "Clear terminal screen",
    "pattern": "clear",
    "example": "clear",
    "category": "Terminal & Session",
    "tags": [
      "terminal"
    ]
  },
  {
    "id": "echo-redir",
    "name": "echo",
    "explanation": "Write text to stdout or files",
    "pattern": "echo text > file",
    "example": "echo '127.0.0.1 api.local' | sudo tee -a /etc/hosts",
    "category": "Pipes & Redirection",
    "tags": [
      "redirect"
    ]
  },
  {
    "id": "printf",
    "name": "printf",
    "explanation": "Formatted output",
    "pattern": "printf format args",
    "example": "printf '%s\n' api",
    "category": "Pipes & Redirection",
    "tags": [
      "format"
    ]
  },
  {
    "id": "test",
    "name": "test",
    "explanation": "Evaluate expression status",
    "pattern": "test condition",
    "example": "test -f /etc/nginx/nginx.conf && echo ok",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "true",
    "name": "true",
    "explanation": "Return success exit status",
    "pattern": "true",
    "example": "true",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "false",
    "name": "false",
    "explanation": "Return failure exit status",
    "pattern": "false",
    "example": "false",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "sleep",
    "name": "sleep",
    "explanation": "Pause for seconds",
    "pattern": "sleep N",
    "example": "sleep 5 && curl -f localhost/health",
    "category": "Shell Builtins",
    "tags": [
      "shell"
    ]
  },
  {
    "id": "date",
    "name": "date",
    "explanation": "Print or set system date",
    "pattern": "date [format]",
    "example": "date -u +%Y-%m-%dT%H:%M:%SZ",
    "category": "Shell Builtins",
    "tags": [
      "time"
    ]
  },
  {
    "id": "cal",
    "name": "cal",
    "explanation": "Display calendar",
    "pattern": "cal month year",
    "example": "cal 7 2026",
    "category": "Shell Builtins",
    "tags": [
      "time"
    ]
  },
  {
    "id": "seq",
    "name": "seq",
    "explanation": "Print number sequence",
    "pattern": "seq start end",
    "example": "seq 1 10 | xargs -I{} curl -s localhost/item/{}",
    "category": "Shell Builtins",
    "tags": [
      "math"
    ]
  },
  {
    "id": "bc",
    "name": "bc",
    "explanation": "Arbitrary precision calculator",
    "pattern": "echo expr | bc",
    "example": "echo 'scale=2; 1024/768' | bc",
    "category": "Shell Builtins",
    "tags": [
      "math"
    ]
  },
  {
    "id": "openssl",
    "name": "openssl",
    "explanation": "Cryptography toolkit",
    "pattern": "openssl subcommand",
    "example": "openssl rand -hex 32",
    "category": "Security",
    "tags": [
      "crypto"
    ]
  },
  {
    "id": "gpg",
    "name": "gpg",
    "explanation": "OpenPGP encryption and signing",
    "pattern": "gpg --decrypt file",
    "example": "gpg --verify release.sig release.tar.gz",
    "category": "Security",
    "tags": [
      "crypto"
    ]
  },
  {
    "id": "fail2ban-client",
    "name": "fail2ban-client",
    "explanation": "Control Fail2ban jails",
    "pattern": "fail2ban-client status",
    "example": "fail2ban-client status sshd",
    "category": "Security",
    "tags": [
      "hardening"
    ]
  },
  {
    "id": "auditctl",
    "name": "auditctl",
    "explanation": "Control Linux audit daemon",
    "pattern": "auditctl -l",
    "example": "auditctl -w /etc/passwd -p wa -k passwd_changes",
    "category": "Security",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "ausearch",
    "name": "ausearch",
    "explanation": "Search audit daemon logs",
    "pattern": "ausearch -k key",
    "example": "ausearch -k passwd_changes -ts recent",
    "category": "Security",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "aureport",
    "name": "aureport",
    "explanation": "Summarize audit logs",
    "pattern": "aureport -s",
    "example": "aureport -u -i",
    "category": "Security",
    "tags": [
      "audit"
    ]
  },
  {
    "id": "chroot",
    "name": "chroot",
    "explanation": "Run command in new root",
    "pattern": "chroot /path cmd",
    "example": "chroot /mnt/recovery /bin/bash",
    "category": "Security",
    "tags": [
      "isolation"
    ]
  },
  {
    "id": "docker",
    "name": "docker",
    "explanation": "Container runtime CLI",
    "pattern": "docker [subcommand]",
    "example": "docker ps --format 'table {{.Names}}\\t{{.Status}}'",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "podman",
    "name": "podman",
    "explanation": "Daemonless container engine",
    "pattern": "podman ps",
    "example": "podman run -d --name api -p 8080:8080 api:latest",
    "category": "Containers & Cloud",
    "tags": [
      "containers"
    ]
  },
  {
    "id": "kubectl",
    "name": "kubectl",
    "explanation": "Kubernetes cluster CLI",
    "pattern": "kubectl [subcommand]",
    "example": "kubectl get pods -A -o wide",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm",
    "name": "helm",
    "explanation": "Kubernetes package manager",
    "pattern": "helm [subcommand]",
    "example": "helm upgrade --install api ./chart -f prod.yaml",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "k9s",
    "name": "k9s",
    "explanation": "Terminal UI for Kubernetes",
    "pattern": "k9s -n prod",
    "example": "k9s -n prod --context prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "minikube",
    "name": "minikube",
    "explanation": "Local Kubernetes cluster",
    "pattern": "minikube start",
    "example": "minikube start --driver=docker",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kind",
    "name": "kind",
    "explanation": "Kubernetes in Docker",
    "pattern": "kind create cluster",
    "example": "kind create cluster --name ci",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "terraform",
    "name": "terraform",
    "explanation": "Infrastructure as code tool",
    "pattern": "terraform [subcommand]",
    "example": "terraform plan -var-file=prod.tfvars",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "ansible",
    "name": "ansible",
    "explanation": "Agentless automation",
    "pattern": "ansible -m ping all",
    "example": "ansible-playbook -i inventory site.yml --check",
    "category": "Containers & Cloud",
    "tags": [
      "automation"
    ]
  },
  {
    "id": "aws",
    "name": "aws",
    "explanation": "AWS CLI",
    "pattern": "aws service operation",
    "example": "aws s3 sync ./dist s3://bucket/app/ --delete",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "az",
    "name": "az",
    "explanation": "Azure CLI",
    "pattern": "az group list",
    "example": "az aks get-credentials -g rg -n cluster",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "gcloud",
    "name": "gcloud",
    "explanation": "Google Cloud CLI",
    "pattern": "gcloud config list",
    "example": "gcloud compute ssh bastion --zone us-central1-a",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "mysql",
    "name": "mysql",
    "explanation": "MySQL/MariaDB client",
    "pattern": "mysql [options]",
    "example": "mysql -h db -u app -p -e 'SHOW PROCESSLIST'",
    "category": "Database CLI",
    "tags": [
      "mysql"
    ]
  },
  {
    "id": "mysqldump",
    "name": "mysqldump",
    "explanation": "Logical MySQL backup",
    "pattern": "mysqldump db",
    "example": "mysqldump -h db -u root -p --single-transaction app > app.sql",
    "category": "Database CLI",
    "tags": [
      "mysql"
    ]
  },
  {
    "id": "mysqladmin",
    "name": "mysqladmin",
    "explanation": "MySQL admin client",
    "pattern": "mysqladmin ping",
    "example": "mysqladmin -h db ping",
    "category": "Database CLI",
    "tags": [
      "mysql"
    ]
  },
  {
    "id": "psql",
    "name": "psql",
    "explanation": "PostgreSQL interactive terminal",
    "pattern": "psql conninfo",
    "example": "psql postgresql://app@db/prod -c 'SELECT pg_is_in_recovery();'",
    "category": "Database CLI",
    "tags": [
      "postgres"
    ]
  },
  {
    "id": "pg-dump",
    "name": "pg_dump",
    "explanation": "PostgreSQL logical backup",
    "pattern": "pg_dump db",
    "example": "pg_dump -Fc -h db -U app app > app.dump",
    "category": "Database CLI",
    "tags": [
      "postgres"
    ]
  },
  {
    "id": "pg-isready",
    "name": "pg_isready",
    "explanation": "Check PostgreSQL connection",
    "pattern": "pg_isready -h host",
    "example": "pg_isready -h db -p 5432",
    "category": "Database CLI",
    "tags": [
      "postgres"
    ]
  },
  {
    "id": "redis-cli",
    "name": "redis-cli",
    "explanation": "Redis command-line interface",
    "pattern": "redis-cli -h host",
    "example": "redis-cli -h cache INFO memory",
    "category": "Database CLI",
    "tags": [
      "redis"
    ]
  },
  {
    "id": "mongo",
    "name": "mongosh",
    "explanation": "MongoDB shell",
    "pattern": "mongosh uri",
    "example": "mongosh 'mongodb://mongo/prod' --eval 'db.stats()'",
    "category": "Database CLI",
    "tags": [
      "mongodb"
    ]
  },
  {
    "id": "sqlite3",
    "name": "sqlite3",
    "explanation": "SQLite interactive shell",
    "pattern": "sqlite3 db file",
    "example": "sqlite3 /var/lib/app/data.db '.tables'",
    "category": "Database CLI",
    "tags": [
      "sqlite"
    ]
  },
  {
    "id": "launchctl",
    "name": "launchctl",
    "explanation": "macOS service manager",
    "pattern": "launchctl list",
    "example": "launchctl list | grep com.apple",
    "category": "macOS / BSD",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "pfctl",
    "name": "pfctl",
    "explanation": "OpenBSD/macOS packet filter",
    "pattern": "pfctl -sr",
    "example": "pfctl -sr | head",
    "category": "macOS / BSD",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "diskutil",
    "name": "diskutil",
    "explanation": "macOS disk management",
    "pattern": "diskutil list",
    "example": "diskutil list",
    "category": "macOS / BSD",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "networksetup",
    "name": "networksetup",
    "explanation": "macOS network configuration",
    "pattern": "networksetup -listallhardwareports",
    "example": "networksetup -getinfo Wi-Fi",
    "category": "macOS / BSD",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "dscl",
    "name": "dscl",
    "explanation": "Directory Service command line",
    "pattern": "dscl . -read /Users/name",
    "example": "dscl . -list /Users",
    "category": "macOS / BSD",
    "tags": [
      "macos"
    ]
  },
  {
    "id": "sysctl",
    "name": "sysctl",
    "explanation": "Read or write kernel parameters",
    "pattern": "sysctl name",
    "example": "sysctl -a | grep net.ipv4.tcp",
    "category": "Linux Specific",
    "tags": [
      "kernel"
    ]
  },
  {
    "id": "modprobe",
    "name": "modprobe",
    "explanation": "Load or remove kernel modules",
    "pattern": "modprobe module",
    "example": "modprobe nf_conntrack",
    "category": "Linux Specific",
    "tags": [
      "kernel"
    ]
  },
  {
    "id": "lsmod",
    "name": "lsmod",
    "explanation": "List loaded kernel modules",
    "pattern": "lsmod",
    "example": "lsmod | grep br_netfilter",
    "category": "Linux Specific",
    "tags": [
      "kernel"
    ]
  },
  {
    "id": "setfacl",
    "name": "setfacl",
    "explanation": "Set POSIX ACLs on files",
    "pattern": "setfacl -m u:user:rx file",
    "example": "setfacl -m u:deploy:rwx /srv/app",
    "category": "Linux Specific",
    "tags": [
      "acl"
    ]
  },
  {
    "id": "getfacl",
    "name": "getfacl",
    "explanation": "Get POSIX ACLs on files",
    "pattern": "getfacl file",
    "example": "getfacl /srv/app/shared",
    "category": "Linux Specific",
    "tags": [
      "acl"
    ]
  },
  {
    "id": "sestatus",
    "name": "sestatus",
    "explanation": "SELinux status summary",
    "pattern": "sestatus",
    "example": "sestatus -b",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "getenforce",
    "name": "getenforce",
    "explanation": "Show SELinux enforcing mode",
    "pattern": "getenforce",
    "example": "getenforce",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "setenforce",
    "name": "setenforce",
    "explanation": "Toggle SELinux enforcing",
    "pattern": "setenforce 0|1",
    "example": "setenforce 0",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "restorecon",
    "name": "restorecon",
    "explanation": "Restore SELinux file contexts",
    "pattern": "restorecon -Rv path",
    "example": "restorecon -Rv /srv/www",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "chcon",
    "name": "chcon",
    "explanation": "Change SELinux security context",
    "pattern": "chcon -t type file",
    "example": "chcon -t httpd_sys_content_t /var/www/html/index.html",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "semodule",
    "name": "semodule",
    "explanation": "Manage SELinux policy modules",
    "pattern": "semodule -l",
    "example": "semodule -l | grep httpd",
    "category": "Linux Specific",
    "tags": [
      "selinux"
    ]
  },
  {
    "id": "needrestart",
    "name": "needrestart",
    "explanation": "Check services needing restart",
    "pattern": "needrestart -r a",
    "example": "needrestart -b",
    "category": "Linux Specific",
    "tags": [
      "patching"
    ]
  },
  {
    "id": "resolvectl",
    "name": "resolvectl",
    "explanation": "Manage systemd-resolved DNS",
    "pattern": "resolvectl status",
    "example": "resolvectl query api.internal",
    "category": "Linux Specific",
    "tags": [
      "dns"
    ]
  },
  {
    "id": "nmcli",
    "name": "nmcli",
    "explanation": "NetworkManager CLI",
    "pattern": "nmcli dev status",
    "example": "nmcli con show --active",
    "category": "Linux Specific",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ethtool",
    "name": "ethtool",
    "explanation": "Display or change NIC settings",
    "pattern": "ethtool iface",
    "example": "ethtool -S eth0 | grep -i error",
    "category": "Linux Specific",
    "tags": [
      "network"
    ]
  },
  {
    "id": "conntrack",
    "name": "conntrack",
    "explanation": "Netfilter connection tracking",
    "pattern": "conntrack -L",
    "example": "conntrack -L | wc -l",
    "category": "Linux Specific",
    "tags": [
      "firewall"
    ]
  },
  {
    "id": "coredumpctl",
    "name": "coredumpctl",
    "explanation": "Manage systemd coredumps",
    "pattern": "coredumpctl list",
    "example": "coredumpctl info $(coredumpctl list | tail -1 | awk '{print $5}')",
    "category": "Monitoring & Logs",
    "tags": [
      "debug"
    ]
  },
  {
    "id": "git-clone",
    "name": "git clone",
    "explanation": "Clone remote repository",
    "pattern": "git clone <url> [dir]",
    "example": "git clone git@github.com:org/platform.git",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-init",
    "name": "git init",
    "explanation": "Initialize repository",
    "pattern": "git init [dir]",
    "example": "git init",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-add",
    "name": "git add",
    "explanation": "Stage changes",
    "pattern": "git add path",
    "example": "git add -p",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-commit",
    "name": "git commit",
    "explanation": "Record staged changes",
    "pattern": "git commit -m msg",
    "example": "git commit -m 'fix(ap): retry backoff'",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-status",
    "name": "git status",
    "explanation": "Show working tree status",
    "pattern": "git status -sb",
    "example": "git status -sb",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-log",
    "name": "git log",
    "explanation": "Show commit history",
    "pattern": "git log [options]",
    "example": "git log --oneline --graph -20",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-diff",
    "name": "git diff",
    "explanation": "Show changes",
    "pattern": "git diff [ref]",
    "example": "git diff origin/main...HEAD",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-branch",
    "name": "git branch",
    "explanation": "List or manage branches",
    "pattern": "git branch name",
    "example": "git branch -vv",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-checkout",
    "name": "git checkout",
    "explanation": "Switch branches or paths",
    "pattern": "git checkout ref",
    "example": "git checkout -b hotfix/502",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-switch",
    "name": "git switch",
    "explanation": "Switch branches (modern)",
    "pattern": "git switch branch",
    "example": "git switch main",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-merge",
    "name": "git merge",
    "explanation": "Merge branches",
    "pattern": "git merge branch",
    "example": "git merge --no-ff release/1.4",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-rebase",
    "name": "git rebase",
    "explanation": "Reapply commits on base",
    "pattern": "git rebase base",
    "example": "git rebase -i origin/main",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-pull",
    "name": "git pull",
    "explanation": "Fetch and integrate",
    "pattern": "git pull remote branch",
    "example": "git pull --rebase origin main",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-push",
    "name": "git push",
    "explanation": "Publish commits",
    "pattern": "git push remote branch",
    "example": "git push origin hotfix/502",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-fetch",
    "name": "git fetch",
    "explanation": "Download objects without merge",
    "pattern": "git fetch --all",
    "example": "git fetch --all --prune",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-remote",
    "name": "git remote",
    "explanation": "Manage remotes",
    "pattern": "git remote -v",
    "example": "git remote add upstream git@github.com:org/upstream.git",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-stash",
    "name": "git stash",
    "explanation": "Stash working changes",
    "pattern": "git stash push",
    "example": "git stash push -m 'wip perf'",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-tag",
    "name": "git tag",
    "explanation": "Create or list tags",
    "pattern": "git tag name",
    "example": "git tag -a v2.3.0 -m 'release'",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-show",
    "name": "git show",
    "explanation": "Show commit or object",
    "pattern": "git show ref",
    "example": "git show HEAD:src/main.go",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-reset",
    "name": "git reset",
    "explanation": "Reset HEAD or index",
    "pattern": "git reset mode ref",
    "example": "git reset --hard origin/main",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-revert",
    "name": "git revert",
    "explanation": "Revert commit safely",
    "pattern": "git revert commit",
    "example": "git revert --no-edit abc1234",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-cherry-pick",
    "name": "git cherry-pick",
    "explanation": "Apply commit elsewhere",
    "pattern": "git cherry-pick commit",
    "example": "git cherry-pick -x def5678",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-bisect",
    "name": "git bisect",
    "explanation": "Binary search bad commit",
    "pattern": "git bisect start",
    "example": "git bisect run npm test",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-blame",
    "name": "git blame",
    "explanation": "Show line authorship",
    "pattern": "git blame file",
    "example": "git blame -L 120,160 src/handler.ts",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-grep",
    "name": "git grep",
    "explanation": "Search tracked files",
    "pattern": "git grep pattern",
    "example": "git grep -n 'TODO'",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-clean",
    "name": "git clean",
    "explanation": "Remove untracked files",
    "pattern": "git clean -fd",
    "example": "git clean -fdX",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-mv",
    "name": "git mv",
    "explanation": "Move tracked file",
    "pattern": "git mv src dst",
    "example": "git mv old.ts new.ts",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-rm",
    "name": "git rm",
    "explanation": "Remove tracked file",
    "pattern": "git rm file",
    "example": "git rm --cached secret.env",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-config",
    "name": "git config",
    "explanation": "Read or set git config",
    "pattern": "git config key",
    "example": "git config --global pull.rebase true",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-worktree",
    "name": "git worktree",
    "explanation": "Manage linked worktrees",
    "pattern": "git worktree add path",
    "example": "git worktree add ../hotfix hotfix/502",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-submodule",
    "name": "git submodule",
    "explanation": "Manage nested repositories",
    "pattern": "git submodule update",
    "example": "git submodule update --init --recursive",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-reflog",
    "name": "git reflog",
    "explanation": "Reference log for HEAD",
    "pattern": "git reflog",
    "example": "git reflog --date=iso | head",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-archive",
    "name": "git archive",
    "explanation": "Export tree as archive",
    "pattern": "git archive --format=tar",
    "example": "git archive --format=tar HEAD | tar -t | head",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-describe",
    "name": "git describe",
    "explanation": "Human-readable name from tag",
    "pattern": "git describe --tags",
    "example": "git describe --tags --always",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-shortlog",
    "name": "git shortlog",
    "explanation": "Summarize commits by author",
    "pattern": "git shortlog -sn",
    "example": "git shortlog -sn --since='30 days ago'",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-rev-parse",
    "name": "git rev-parse",
    "explanation": "Parse revision names",
    "pattern": "git rev-parse ref",
    "example": "git rev-parse HEAD",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-fsck",
    "name": "git fsck",
    "explanation": "Verify connectivity and integrity",
    "pattern": "git fsck --full",
    "example": "git fsck --full",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-bundle",
    "name": "git bundle",
    "explanation": "Move repo over offline media",
    "pattern": "git bundle create file refs",
    "example": "git bundle create backup.bundle --all",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "git-maintenance",
    "name": "git maintenance",
    "explanation": "Run background maintenance",
    "pattern": "git maintenance run",
    "example": "git maintenance run --schedule=hourly",
    "category": "Development Tools",
    "tags": [
      "git"
    ]
  },
  {
    "id": "docker-ps",
    "name": "docker ps",
    "explanation": "List containers",
    "pattern": "docker ps [options]",
    "example": "docker ps -a --filter status=exited",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-run",
    "name": "docker run",
    "explanation": "Run container from image",
    "pattern": "docker run image cmd",
    "example": "docker run -d --name api -p 8080:8080 api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-exec",
    "name": "docker exec",
    "explanation": "Run command in container",
    "pattern": "docker exec -it c cmd",
    "example": "docker exec -it api sh -lc 'curl localhost:8080/health'",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-logs",
    "name": "docker logs",
    "explanation": "Fetch container logs",
    "pattern": "docker logs container",
    "example": "docker logs --since 10m api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-build",
    "name": "docker build",
    "explanation": "Build image from Dockerfile",
    "pattern": "docker build -t tag .",
    "example": "docker build -t api:2.3 .",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-pull",
    "name": "docker pull",
    "explanation": "Pull image from registry",
    "pattern": "docker pull image",
    "example": "docker pull registry.io/app/api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-push",
    "name": "docker push",
    "explanation": "Push image to registry",
    "pattern": "docker push image",
    "example": "docker push registry.io/app/api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-images",
    "name": "docker images",
    "explanation": "List local images",
    "pattern": "docker images",
    "example": "docker images --digests",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-rmi",
    "name": "docker rmi",
    "explanation": "Remove images",
    "pattern": "docker rmi image",
    "example": "docker rmi $(docker images -f dangling=true -q)",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-stop",
    "name": "docker stop",
    "explanation": "Stop running container",
    "pattern": "docker stop container",
    "example": "docker stop api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-start",
    "name": "docker start",
    "explanation": "Start stopped container",
    "pattern": "docker start container",
    "example": "docker start api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-restart",
    "name": "docker restart",
    "explanation": "Restart container",
    "pattern": "docker restart container",
    "example": "docker restart api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-kill",
    "name": "docker kill",
    "explanation": "Send signal to container",
    "pattern": "docker kill container",
    "example": "docker kill -s HUP api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-rm",
    "name": "docker rm",
    "explanation": "Remove container",
    "pattern": "docker rm container",
    "example": "docker rm -f api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-inspect",
    "name": "docker inspect",
    "explanation": "Return low-level JSON metadata",
    "pattern": "docker inspect object",
    "example": "docker inspect -f '{{.State.Health.Status}}' api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-network",
    "name": "docker network",
    "explanation": "Manage networks",
    "pattern": "docker network ls",
    "example": "docker network inspect bridge",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-volume",
    "name": "docker volume",
    "explanation": "Manage volumes",
    "pattern": "docker volume ls",
    "example": "docker volume inspect app-data",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-system",
    "name": "docker system",
    "explanation": "Docker system management",
    "pattern": "docker system df",
    "example": "docker system df -v",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-stats",
    "name": "docker stats",
    "explanation": "Live resource usage",
    "pattern": "docker stats",
    "example": "docker stats --no-stream",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-events",
    "name": "docker events",
    "explanation": "Stream real-time events",
    "pattern": "docker events",
    "example": "docker events --since 30m --filter container=api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-cp",
    "name": "docker cp",
    "explanation": "Copy files to/from container",
    "pattern": "docker cp src container:dst",
    "example": "docker cp api:/var/log/app.log ./",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-export",
    "name": "docker export",
    "explanation": "Export container filesystem",
    "pattern": "docker export container",
    "example": "docker export api > api-rootfs.tar",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-import",
    "name": "docker import",
    "explanation": "Import tarball as image",
    "pattern": "docker import file repo:tag",
    "example": "docker import api-rootfs.tar api:imported",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-tag",
    "name": "docker tag",
    "explanation": "Tag image with reference",
    "pattern": "docker tag src dst",
    "example": "docker tag api:2.3 registry.io/app/api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-login",
    "name": "docker login",
    "explanation": "Log in to registry",
    "pattern": "docker login registry",
    "example": "docker login registry.io",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-logout",
    "name": "docker logout",
    "explanation": "Log out from registry",
    "pattern": "docker logout registry",
    "example": "docker logout registry.io",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-context",
    "name": "docker context",
    "explanation": "Manage docker contexts",
    "pattern": "docker context ls",
    "example": "docker context use prod",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-builder",
    "name": "docker builder",
    "explanation": "Manage buildx builders",
    "pattern": "docker builder ls",
    "example": "docker builder prune -af",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-compose",
    "name": "docker compose",
    "explanation": "Manage multi-container apps",
    "pattern": "docker compose up",
    "example": "docker compose -f docker-compose.prod.yml up -d",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-compose-logs",
    "name": "compose logs",
    "explanation": "Tail compose service logs",
    "pattern": "docker compose logs svc",
    "example": "docker compose logs -f --tail=200 api",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-compose-ps",
    "name": "compose ps",
    "explanation": "List compose services",
    "pattern": "docker compose ps",
    "example": "docker compose ps",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-compose-down",
    "name": "compose down",
    "explanation": "Stop and remove stack",
    "pattern": "docker compose down",
    "example": "docker compose down -v",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-scan",
    "name": "docker scan",
    "explanation": "Scan image for vulnerabilities",
    "pattern": "docker scan image",
    "example": "docker scan api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "docker-trust",
    "name": "docker trust",
    "explanation": "Manage content trust",
    "pattern": "docker trust inspect image",
    "example": "docker trust inspect registry.io/app/api:2.3",
    "category": "Containers & Cloud",
    "tags": [
      "docker"
    ]
  },
  {
    "id": "kubectl-get",
    "name": "kubectl get",
    "explanation": "List resources",
    "pattern": "kubectl get TYPE",
    "example": "kubectl get pods -n prod -o wide",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-describe",
    "name": "kubectl describe",
    "explanation": "Show detailed resource state",
    "pattern": "kubectl describe TYPE name",
    "example": "kubectl describe pod api-7d9c8 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-apply",
    "name": "kubectl apply",
    "explanation": "Apply manifest changes",
    "pattern": "kubectl apply -f file",
    "example": "kubectl apply -f deploy/prod/",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-delete",
    "name": "kubectl delete",
    "explanation": "Delete resources",
    "pattern": "kubectl delete TYPE name",
    "example": "kubectl delete pod api-7d9c8 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-create",
    "name": "kubectl create",
    "explanation": "Create resource imperatively",
    "pattern": "kubectl create -f file",
    "example": "kubectl create job migrate --image=tools/migrate:1",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-expose",
    "name": "kubectl expose",
    "explanation": "Expose resource as service",
    "pattern": "kubectl expose deploy name",
    "example": "kubectl expose deploy api --port=80 --target-port=8080",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-logs",
    "name": "kubectl logs",
    "explanation": "Stream pod logs",
    "pattern": "kubectl logs pod",
    "example": "kubectl logs -f deploy/api -n prod --since=1h",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-exec",
    "name": "kubectl exec",
    "explanation": "Execute command in pod",
    "pattern": "kubectl exec pod -- cmd",
    "example": "kubectl exec -it deploy/api -n prod -- sh",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-port-forward",
    "name": "kubectl port-forward",
    "explanation": "Forward local port to pod",
    "pattern": "kubectl port-forward pod ports",
    "example": "kubectl port-forward svc/api 8080:80 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-top",
    "name": "kubectl top",
    "explanation": "Show resource usage",
    "pattern": "kubectl top pods",
    "example": "kubectl top pods -n prod --containers",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-drain",
    "name": "kubectl drain",
    "explanation": "Cordon and evict node pods",
    "pattern": "kubectl drain node",
    "example": "kubectl drain node-3 --ignore-daemonsets",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-cordon",
    "name": "kubectl cordon",
    "explanation": "Mark node unschedulable",
    "pattern": "kubectl cordon node",
    "example": "kubectl cordon node-3",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-uncordon",
    "name": "kubectl uncordon",
    "explanation": "Mark node schedulable",
    "pattern": "kubectl uncordon node",
    "example": "kubectl uncordon node-3",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-taint",
    "name": "kubectl taint",
    "explanation": "Set node taints",
    "pattern": "kubectl taint nodes name",
    "example": "kubectl taint nodes gpu-1 gpu=true:NoSchedule",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-label",
    "name": "kubectl label",
    "explanation": "Add or update labels",
    "pattern": "kubectl label TYPE name",
    "example": "kubectl label pod api-abc version=2.3 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-annotate",
    "name": "kubectl annotate",
    "explanation": "Add or update annotations",
    "pattern": "kubectl annotate TYPE name",
    "example": "kubectl annotate deploy api last/deployed-at=$(date -u +%FT%TZ)",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-scale",
    "name": "kubectl scale",
    "explanation": "Scale replica count",
    "pattern": "kubectl scale deploy --replicas=N",
    "example": "kubectl scale deploy/api -n prod --replicas=6",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-rollout",
    "name": "kubectl rollout",
    "explanation": "Manage rolling updates",
    "pattern": "kubectl rollout subcommand",
    "example": "kubectl rollout status deploy/api -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-auth-can-i",
    "name": "auth can-i",
    "explanation": "Check RBAC permissions",
    "pattern": "kubectl auth can-i verb resource",
    "example": "kubectl auth can-i delete pods --as=deploy-bot -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-config",
    "name": "kubectl config",
    "explanation": "Manage kubeconfig",
    "pattern": "kubectl config view",
    "example": "kubectl config use-context prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-cluster-info",
    "name": "kubectl cluster-info",
    "explanation": "Display cluster endpoint info",
    "pattern": "kubectl cluster-info",
    "example": "kubectl cluster-info dump",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-api-resources",
    "name": "kubectl api-resources",
    "explanation": "List API resources",
    "pattern": "kubectl api-resources",
    "example": "kubectl api-resources | grep networking",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-api-versions",
    "name": "kubectl api-versions",
    "explanation": "List supported API versions",
    "pattern": "kubectl api-versions",
    "example": "kubectl api-versions | grep apps",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-explain",
    "name": "kubectl explain",
    "explanation": "Document resource fields",
    "pattern": "kubectl explain TYPE.field",
    "example": "kubectl explain pod.spec.containers",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-wait",
    "name": "kubectl wait",
    "explanation": "Wait for condition",
    "pattern": "kubectl wait --for=condition=Ready pod",
    "example": "kubectl wait --for=condition=Available deploy/api -n prod --timeout=120s",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-debug",
    "name": "kubectl debug",
    "explanation": "Create debugging copy of pod",
    "pattern": "kubectl debug pod",
    "example": "kubectl debug -it pod/api-abc --copy-to=debug --container=api -- sh",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-attach",
    "name": "kubectl attach",
    "explanation": "Attach to running container",
    "pattern": "kubectl attach pod",
    "example": "kubectl attach -it pod/api-abc -c api",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-cp",
    "name": "kubectl cp",
    "explanation": "Copy files to/from pod",
    "pattern": "kubectl cp ns/pod:path local",
    "example": "kubectl cp prod/api-abc:/tmp/heap.hprof ./heap.hprof",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-set",
    "name": "kubectl set",
    "explanation": "Set fields on resources",
    "pattern": "kubectl set image deploy/name",
    "example": "kubectl set image deploy/api api=registry.io/app/api:2.3 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-patch",
    "name": "kubectl patch",
    "explanation": "Patch resource JSON",
    "pattern": "kubectl patch TYPE name",
    "example": "kubectl patch deploy api -n prod -p '{\"spec\":{\"replicas\":4}}'",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-replace",
    "name": "kubectl replace",
    "explanation": "Replace resource from file",
    "pattern": "kubectl replace -f file",
    "example": "kubectl replace --force -f deploy/job.yaml",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-events",
    "name": "kubectl events",
    "explanation": "List cluster events",
    "pattern": "kubectl get events",
    "example": "kubectl get events -n prod --sort-by=.lastTimestamp",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-certificate",
    "name": "kubectl certificate",
    "explanation": "Approve or deny CSR",
    "pattern": "kubectl certificate approve",
    "example": "kubectl certificate approve csr-name",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-crd",
    "name": "kubectl crd",
    "explanation": "Manage custom resource definitions",
    "pattern": "kubectl get crd",
    "example": "kubectl get crd | grep platform",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-api",
    "name": "kubectl api",
    "explanation": "Call Kubernetes API proxy",
    "pattern": "kubectl api -- raw",
    "example": "kubectl get --raw '/readyz?verbose'",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-proxy",
    "name": "kubectl proxy",
    "explanation": "Run local API proxy",
    "pattern": "kubectl proxy",
    "example": "kubectl proxy --port=8001",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-run",
    "name": "kubectl run",
    "explanation": "Run pod imperatively",
    "pattern": "kubectl run name --image=img",
    "example": "kubectl run curl --rm -it --image=curlimages/curl -- curl svc/api",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "kubectl-autoscale",
    "name": "kubectl autoscale",
    "explanation": "Create HPA for deployment",
    "pattern": "kubectl autoscale deploy",
    "example": "kubectl autoscale deploy api -n prod --min=2 --max=10 --cpu-percent=70",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "systemctl-start",
    "name": "systemctl start",
    "explanation": "Start unit",
    "pattern": "systemctl start unit",
    "example": "systemctl start nginx",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-stop",
    "name": "systemctl stop",
    "explanation": "Stop unit",
    "pattern": "systemctl stop unit",
    "example": "systemctl stop nginx",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-restart",
    "name": "systemctl restart",
    "explanation": "Restart unit",
    "pattern": "systemctl restart unit",
    "example": "systemctl restart api.service",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-reload",
    "name": "systemctl reload",
    "explanation": "Reload unit configuration",
    "pattern": "systemctl reload unit",
    "example": "systemctl reload nginx",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-status",
    "name": "systemctl status",
    "explanation": "Show unit status",
    "pattern": "systemctl status unit",
    "example": "systemctl status api.service",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-enable",
    "name": "systemctl enable",
    "explanation": "Enable unit at boot",
    "pattern": "systemctl enable unit",
    "example": "systemctl enable docker",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-disable",
    "name": "systemctl disable",
    "explanation": "Disable unit at boot",
    "pattern": "systemctl disable unit",
    "example": "systemctl disable legacy-agent",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-is-active",
    "name": "systemctl is-active",
    "explanation": "Check if unit active",
    "pattern": "systemctl is-active unit",
    "example": "systemctl is-active nginx",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-is-enabled",
    "name": "systemctl is-enabled",
    "explanation": "Check if unit enabled",
    "pattern": "systemctl is-enabled unit",
    "example": "systemctl is-enabled docker",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-is-failed",
    "name": "systemctl is-failed",
    "explanation": "Check if unit failed",
    "pattern": "systemctl is-failed unit",
    "example": "systemctl is-failed api.service",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-list-units",
    "name": "systemctl list-units",
    "explanation": "List loaded units",
    "pattern": "systemctl list-units",
    "example": "systemctl list-units --type=service --state=failed",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-list-unit-files",
    "name": "systemctl list-unit-files",
    "explanation": "List installed unit files",
    "pattern": "systemctl list-unit-files",
    "example": "systemctl list-unit-files | grep enabled",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-daemon-reload",
    "name": "systemctl daemon-reload",
    "explanation": "Reload systemd manager config",
    "pattern": "systemctl daemon-reload",
    "example": "systemctl daemon-reload",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-mask",
    "name": "systemctl mask",
    "explanation": "Mask unit from starting",
    "pattern": "systemctl mask unit",
    "example": "systemctl mask unattended-upgrades",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-unmask",
    "name": "systemctl unmask",
    "explanation": "Unmask unit",
    "pattern": "systemctl unmask unit",
    "example": "systemctl unmask unattended-upgrades",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-reset-failed",
    "name": "systemctl reset-failed",
    "explanation": "Reset failed state",
    "pattern": "systemctl reset-failed",
    "example": "systemctl reset-failed",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-show",
    "name": "systemctl show",
    "explanation": "Show unit properties",
    "pattern": "systemctl show unit",
    "example": "systemctl show api.service -p ActiveState,SubState",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-cat",
    "name": "systemctl cat",
    "explanation": "Show unit file contents",
    "pattern": "systemctl cat unit",
    "example": "systemctl cat nginx.service",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-edit",
    "name": "systemctl edit",
    "explanation": "Edit drop-in for unit",
    "pattern": "systemctl edit unit",
    "example": "systemctl edit api.service",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "systemctl-set-property",
    "name": "systemctl set-property",
    "explanation": "Set unit runtime property",
    "pattern": "systemctl set-property unit",
    "example": "systemctl set-property api.service CPUQuota=200%",
    "category": "Linux Specific",
    "tags": [
      "systemd"
    ]
  },
  {
    "id": "openssl-req",
    "name": "openssl req",
    "explanation": "Create CSR or self-signed cert",
    "pattern": "openssl req ...",
    "example": "openssl req -new -newkey rsa:2048 -nodes -keyout key.pem -out csr.pem",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-x509",
    "name": "openssl x509",
    "explanation": "Parse or create certificates",
    "pattern": "openssl x509 ...",
    "example": "openssl x509 -in cert.pem -text -noout",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-s-client",
    "name": "openssl s_client",
    "explanation": "Test TLS services",
    "pattern": "openssl s_client -connect host:port",
    "example": "openssl s_client -connect api:443 -servername api",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-s-server",
    "name": "openssl s_server",
    "explanation": "Test TLS server side",
    "pattern": "openssl s_server ...",
    "example": "openssl s_server -accept 8443 -cert cert.pem -key key.pem",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-dgst",
    "name": "openssl dgst",
    "explanation": "Compute message digest",
    "pattern": "openssl dgst -sha256 file",
    "example": "openssl dgst -sha256 release.tar.gz",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-rand",
    "name": "openssl rand",
    "explanation": "Generate random bytes",
    "pattern": "openssl rand -hex n",
    "example": "openssl rand -hex 32",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-enc",
    "name": "openssl enc",
    "explanation": "Encrypt or decrypt data",
    "pattern": "openssl enc ...",
    "example": "openssl enc -aes-256-cbc -salt -in plain.txt -out plain.enc",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-passwd",
    "name": "openssl passwd",
    "explanation": "Hash passwords",
    "pattern": "openssl passwd -6",
    "example": "openssl passwd -6 'temp-secret'",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-verify",
    "name": "openssl verify",
    "explanation": "Verify certificate chains",
    "pattern": "openssl verify cert",
    "example": "openssl verify -CAfile ca.pem server.pem",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-crl",
    "name": "openssl crl",
    "explanation": "Parse CRL files",
    "pattern": "openssl crl -in file",
    "example": "openssl crl -in ca.crl -text -noout",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-pkcs12",
    "name": "openssl pkcs12",
    "explanation": "Import/export PKCS#12 bundles",
    "pattern": "openssl pkcs12 ...",
    "example": "openssl pkcs12 -export -in cert.pem -inkey key.pem -out bundle.p12",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-genrsa",
    "name": "openssl genrsa",
    "explanation": "Generate RSA private key",
    "pattern": "openssl genrsa ...",
    "example": "openssl genrsa -out key.pem 4096",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-ecparam",
    "name": "openssl ecparam",
    "explanation": "EC parameter utilities",
    "pattern": "openssl ecparam ...",
    "example": "openssl ecparam -name prime256v1 -genkey -noout -out ec-key.pem",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-speed",
    "name": "openssl speed",
    "explanation": "Benchmark crypto algorithms",
    "pattern": "openssl speed",
    "example": "openssl speed rsa2048",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "openssl-version",
    "name": "openssl version",
    "explanation": "Show OpenSSL version",
    "pattern": "openssl version -a",
    "example": "openssl version -a",
    "category": "Security",
    "tags": [
      "tls"
    ]
  },
  {
    "id": "ip-addr",
    "name": "ip addr",
    "explanation": "Show or manage addresses",
    "pattern": "ip addr subcommand",
    "example": "ip -br addr show",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-link",
    "name": "ip link",
    "explanation": "Show or manage interfaces",
    "pattern": "ip link subcommand",
    "example": "ip link set eth0 up",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-route",
    "name": "ip route",
    "explanation": "Show or manage routes",
    "pattern": "ip route subcommand",
    "example": "ip route get 8.8.8.8",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-rule",
    "name": "ip rule",
    "explanation": "Policy routing rules",
    "pattern": "ip rule list",
    "example": "ip rule list",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-neigh",
    "name": "ip neigh",
    "explanation": "Neighbor (ARP) table",
    "pattern": "ip neigh show",
    "example": "ip neigh show dev eth0",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-maddr",
    "name": "ip maddr",
    "explanation": "Multicast addresses",
    "pattern": "ip maddr show",
    "example": "ip maddr show",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-tunnel",
    "name": "ip tunnel",
    "explanation": "Tunnel interfaces",
    "pattern": "ip tunnel show",
    "example": "ip tunnel show",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "ip-netns",
    "name": "ip netns",
    "explanation": "Network namespaces",
    "pattern": "ip netns list",
    "example": "ip netns exec vpn ip addr",
    "category": "Networking",
    "tags": [
      "network"
    ]
  },
  {
    "id": "helm-install",
    "name": "helm install",
    "explanation": "Install chart release",
    "pattern": "helm install release chart",
    "example": "helm install api ./chart -f values-prod.yaml",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-upgrade",
    "name": "helm upgrade",
    "explanation": "Upgrade release",
    "pattern": "helm upgrade release chart",
    "example": "helm upgrade api ./chart --set image.tag=2.3",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-uninstall",
    "name": "helm uninstall",
    "explanation": "Remove release",
    "pattern": "helm uninstall release",
    "example": "helm uninstall api -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-list",
    "name": "helm list",
    "explanation": "List releases",
    "pattern": "helm list -A",
    "example": "helm list -A",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-status",
    "name": "helm status",
    "explanation": "Show release status",
    "pattern": "helm status release",
    "example": "helm status api -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-rollback",
    "name": "helm rollback",
    "explanation": "Rollback release revision",
    "pattern": "helm rollback release rev",
    "example": "helm rollback api 12 -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-history",
    "name": "helm history",
    "explanation": "Show release history",
    "pattern": "helm history release",
    "example": "helm history api -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-get",
    "name": "helm get",
    "explanation": "Download release info",
    "pattern": "helm get manifest release",
    "example": "helm get values api -n prod",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-template",
    "name": "helm template",
    "explanation": "Render templates locally",
    "pattern": "helm template release chart",
    "example": "helm template api ./chart -f prod.yaml",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-lint",
    "name": "helm lint",
    "explanation": "Lint chart",
    "pattern": "helm lint chart",
    "example": "helm lint ./chart",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-repo",
    "name": "helm repo",
    "explanation": "Manage chart repositories",
    "pattern": "helm repo add name url",
    "example": "helm repo update",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "helm-search",
    "name": "helm search",
    "explanation": "Search chart repositories",
    "pattern": "helm search repo keyword",
    "example": "helm search repo ingress",
    "category": "Containers & Cloud",
    "tags": [
      "kubernetes"
    ]
  },
  {
    "id": "terraform-init",
    "name": "terraform init",
    "explanation": "Initialize working directory",
    "pattern": "terraform init",
    "example": "terraform init -upgrade",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-plan",
    "name": "terraform plan",
    "explanation": "Preview infrastructure changes",
    "pattern": "terraform plan",
    "example": "terraform plan -var-file=prod.tfvars -out=plan.out",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-apply",
    "name": "terraform apply",
    "explanation": "Apply changes",
    "pattern": "terraform apply",
    "example": "terraform apply plan.out",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-destroy",
    "name": "terraform destroy",
    "explanation": "Destroy managed infrastructure",
    "pattern": "terraform destroy",
    "example": "terraform destroy -target=module.vpc",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-fmt",
    "name": "terraform fmt",
    "explanation": "Format configuration files",
    "pattern": "terraform fmt -recursive",
    "example": "terraform fmt -recursive",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-validate",
    "name": "terraform validate",
    "explanation": "Validate configuration syntax",
    "pattern": "terraform validate",
    "example": "terraform validate",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-output",
    "name": "terraform output",
    "explanation": "Read output values",
    "pattern": "terraform output",
    "example": "terraform output -json",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-state",
    "name": "terraform state",
    "explanation": "Advanced state management",
    "pattern": "terraform state list",
    "example": "terraform state show aws_instance.api",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-import",
    "name": "terraform import",
    "explanation": "Import existing resource",
    "pattern": "terraform import addr id",
    "example": "terraform import aws_s3_bucket.logs my-bucket",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "terraform-workspace",
    "name": "terraform workspace",
    "explanation": "Manage workspaces",
    "pattern": "terraform workspace list",
    "example": "terraform workspace select prod",
    "category": "Containers & Cloud",
    "tags": [
      "iac"
    ]
  },
  {
    "id": "aws-s3-ls",
    "name": "s3 ls",
    "explanation": "List S3 buckets or prefixes",
    "pattern": "aws s3 ls s3://bucket",
    "example": "aws s3 ls s3://logs-prod/app/ --recursive --human-readable",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-s3-sync",
    "name": "s3 sync",
    "explanation": "Sync directories with S3",
    "pattern": "aws s3 sync src dst",
    "example": "aws s3 sync ./dist s3://cdn-bucket/app/ --delete",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-s3-cp",
    "name": "s3 cp",
    "explanation": "Copy objects in S3",
    "pattern": "aws s3 cp src dst",
    "example": "aws s3 cp s3://backups/db.sql.gz ./",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-ec2-describe-instances",
    "name": "ec2 describe-instances",
    "explanation": "Describe EC2 instances",
    "pattern": "aws ec2 describe-instances",
    "example": "aws ec2 describe-instances --filters Name=tag:Env,Values=prod",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-ec2-start-instances",
    "name": "ec2 start-instances",
    "explanation": "Start EC2 instances",
    "pattern": "aws ec2 start-instances --instance-ids",
    "example": "aws ec2 start-instances --instance-ids i-0abc123",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-ec2-stop-instances",
    "name": "ec2 stop-instances",
    "explanation": "Stop EC2 instances",
    "pattern": "aws ec2 stop-instances --instance-ids",
    "example": "aws ec2 stop-instances --instance-ids i-0abc123",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-logs-tail",
    "name": "logs tail",
    "explanation": "Tail CloudWatch log group",
    "pattern": "aws logs tail group",
    "example": "aws logs tail /ecs/api --since 1h --follow",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-logs-filter-log-events",
    "name": "logs filter-log-events",
    "explanation": "Filter CloudWatch events",
    "pattern": "aws logs filter-log-events",
    "example": "aws logs filter-log-events --log-group-name /ecs/api --filter-pattern ERROR",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-sts-get-caller-identity",
    "name": "sts get-caller-identity",
    "explanation": "Show AWS caller identity",
    "pattern": "aws sts get-caller-identity",
    "example": "aws sts get-caller-identity",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-iam-list-users",
    "name": "iam list-users",
    "explanation": "List IAM users",
    "pattern": "aws iam list-users",
    "example": "aws iam list-users",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-eks-update-kubeconfig",
    "name": "eks update-kubeconfig",
    "explanation": "Configure kubectl for EKS",
    "pattern": "aws eks update-kubeconfig",
    "example": "aws eks update-kubeconfig --name prod --region us-east-1",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-cloudformation-describe-stacks",
    "name": "cloudformation describe-stacks",
    "explanation": "Describe CloudFormation stacks",
    "pattern": "aws cloudformation describe-stacks",
    "example": "aws cloudformation describe-stacks --stack-name prod",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-secretsmanager-get-secret-value",
    "name": "secretsmanager get-secret-value",
    "explanation": "Fetch secret value",
    "pattern": "aws secretsmanager get-secret-value",
    "example": "aws secretsmanager get-secret-value --secret-id prod/db",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-lambda-invoke",
    "name": "lambda invoke",
    "explanation": "Invoke Lambda function",
    "pattern": "aws lambda invoke",
    "example": "aws lambda invoke --function-name api-warmup out.json",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  },
  {
    "id": "aws-autoscaling-describe-auto-scaling-groups",
    "name": "autoscaling describe-auto-scaling-groups",
    "explanation": "Describe ASGs",
    "pattern": "aws autoscaling describe-auto-scaling-groups",
    "example": "aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names api-asg",
    "category": "Containers & Cloud",
    "tags": [
      "cloud"
    ]
  }
];

const scenarios = [
  {
    "id": "scenario-0001",
    "scenario": "Trace nginx upstream timeouts during a 502 spike",
    "codePattern": "grep|awk|sort",
    "example": "grep ' 502 ' /var/log/nginx/access.log | awk '{print $NF}' | sort | uniq -c | sort -nr | head",
    "tags": [
      "devops",
      "nginx",
      "logs"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0002",
    "scenario": "Find pods with high restart counts in production",
    "codePattern": "kubectl jsonpath",
    "example": "kubectl get pods -n prod -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.containerStatuses[0].restartCount}{\"\\n\"}{end}'",
    "tags": [
      "kubernetes",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0003",
    "scenario": "Validate TLS certificate expiry for public API",
    "codePattern": "openssl s_client",
    "example": "echo | openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null | openssl x509 -noout -enddate",
    "tags": [
      "security",
      "tls"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0004",
    "scenario": "Identify top CPU consumers on a saturated node",
    "codePattern": "ps sort",
    "example": "ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -20",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0005",
    "scenario": "Audit world-writable files under /etc",
    "codePattern": "find perm",
    "example": "find /etc -xdev -type f -perm -0002 -ls 2>/dev/null",
    "tags": [
      "security",
      "audit"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0006",
    "scenario": "Correlate ERROR lines with a request id across services",
    "codePattern": "rg multi-file",
    "example": "rg -n 'req_id=abc123' /var/log/api /var/log/worker /var/log/nginx",
    "tags": [
      "debugging",
      "logs"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0007",
    "scenario": "Check PostgreSQL replica recovery status",
    "codePattern": "psql query",
    "example": "psql -h db-replica -U monitor -tAc 'SELECT pg_is_in_recovery();'",
    "tags": [
      "database",
      "postgres"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0008",
    "scenario": "Dump long-running MySQL queries during locks",
    "codePattern": "mysql processlist",
    "example": "mysql -h db -e \"SELECT id,user,time,state,LEFT(info,120) FROM information_schema.processlist WHERE command!='Sleep' ORDER BY time DESC;\"",
    "tags": [
      "database",
      "mysql"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0009",
    "scenario": "List failed systemd units after deploy",
    "codePattern": "systemctl failed",
    "example": "systemctl --failed --no-pager",
    "tags": [
      "devops",
      "systemd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0010",
    "scenario": "Inspect Docker healthcheck failure history",
    "codePattern": "docker inspect",
    "example": "docker inspect -f '{{json .State.Health}}' api | jq",
    "tags": [
      "docker",
      "debugging"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0011",
    "scenario": "Tail structured errors for api in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/api --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0012",
    "scenario": "Verify api rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/api -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0013",
    "scenario": "Check RBAC for CI deployer on api in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/api --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0014",
    "scenario": "Tail structured errors for worker in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/worker --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0015",
    "scenario": "Verify worker rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/worker -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0016",
    "scenario": "Check RBAC for CI deployer on worker in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/worker --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0017",
    "scenario": "Tail structured errors for billing in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/billing --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0018",
    "scenario": "Verify billing rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/billing -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0019",
    "scenario": "Check RBAC for CI deployer on billing in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/billing --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0020",
    "scenario": "Tail structured errors for auth in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/auth --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0021",
    "scenario": "Verify auth rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/auth -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0022",
    "scenario": "Check RBAC for CI deployer on auth in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/auth --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0023",
    "scenario": "Tail structured errors for search in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/search --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0024",
    "scenario": "Verify search rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/search -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0025",
    "scenario": "Check RBAC for CI deployer on search in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/search --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0026",
    "scenario": "Tail structured errors for ingest in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/ingest --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0027",
    "scenario": "Verify ingest rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/ingest -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0028",
    "scenario": "Check RBAC for CI deployer on ingest in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/ingest --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0029",
    "scenario": "Tail structured errors for notify in prod during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n prod deploy/notify --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0030",
    "scenario": "Verify notify rollout completed in prod",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/notify -n prod --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0031",
    "scenario": "Check RBAC for CI deployer on notify in prod",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/notify --as=system:serviceaccount:ci:deployer -n prod",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0032",
    "scenario": "Tail structured errors for api in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/api --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0033",
    "scenario": "Verify api rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/api -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0034",
    "scenario": "Check RBAC for CI deployer on api in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/api --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0035",
    "scenario": "Tail structured errors for worker in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/worker --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0036",
    "scenario": "Verify worker rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/worker -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0037",
    "scenario": "Check RBAC for CI deployer on worker in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/worker --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0038",
    "scenario": "Tail structured errors for billing in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/billing --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0039",
    "scenario": "Verify billing rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/billing -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0040",
    "scenario": "Check RBAC for CI deployer on billing in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/billing --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0041",
    "scenario": "Tail structured errors for auth in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/auth --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0042",
    "scenario": "Verify auth rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/auth -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0043",
    "scenario": "Check RBAC for CI deployer on auth in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/auth --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0044",
    "scenario": "Tail structured errors for search in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/search --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0045",
    "scenario": "Verify search rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/search -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0046",
    "scenario": "Check RBAC for CI deployer on search in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/search --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0047",
    "scenario": "Tail structured errors for ingest in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/ingest --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0048",
    "scenario": "Verify ingest rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/ingest -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0049",
    "scenario": "Check RBAC for CI deployer on ingest in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/ingest --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0050",
    "scenario": "Tail structured errors for notify in staging during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n staging deploy/notify --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0051",
    "scenario": "Verify notify rollout completed in staging",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/notify -n staging --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0052",
    "scenario": "Check RBAC for CI deployer on notify in staging",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/notify --as=system:serviceaccount:ci:deployer -n staging",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0053",
    "scenario": "Tail structured errors for api in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/api --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0054",
    "scenario": "Verify api rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/api -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0055",
    "scenario": "Check RBAC for CI deployer on api in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/api --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0056",
    "scenario": "Tail structured errors for worker in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/worker --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0057",
    "scenario": "Verify worker rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/worker -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0058",
    "scenario": "Check RBAC for CI deployer on worker in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/worker --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0059",
    "scenario": "Tail structured errors for billing in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/billing --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0060",
    "scenario": "Verify billing rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/billing -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0061",
    "scenario": "Check RBAC for CI deployer on billing in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/billing --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0062",
    "scenario": "Tail structured errors for auth in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/auth --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0063",
    "scenario": "Verify auth rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/auth -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0064",
    "scenario": "Check RBAC for CI deployer on auth in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/auth --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0065",
    "scenario": "Tail structured errors for search in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/search --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0066",
    "scenario": "Verify search rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/search -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0067",
    "scenario": "Check RBAC for CI deployer on search in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/search --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0068",
    "scenario": "Tail structured errors for ingest in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/ingest --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0069",
    "scenario": "Verify ingest rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/ingest -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0070",
    "scenario": "Check RBAC for CI deployer on ingest in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/ingest --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0071",
    "scenario": "Tail structured errors for notify in payments during incident",
    "codePattern": "kubectl logs + filter",
    "example": "kubectl logs -n payments deploy/notify --since=30m | rg '\"level\":\"error\"'",
    "tags": [
      "kubernetes",
      "logs",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0072",
    "scenario": "Verify notify rollout completed in payments",
    "codePattern": "kubectl rollout status",
    "example": "kubectl rollout status deploy/notify -n payments --timeout=180s",
    "tags": [
      "kubernetes",
      "cicd",
      "deploy"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0073",
    "scenario": "Check RBAC for CI deployer on notify in payments",
    "codePattern": "kubectl auth can-i",
    "example": "kubectl auth can-i patch deploy/notify --as=system:serviceaccount:ci:deployer -n payments",
    "tags": [
      "kubernetes",
      "security",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0074",
    "scenario": "Measure packet loss to db01 during outage",
    "codePattern": "mtr",
    "example": "mtr -rwzc 50 db01.internal",
    "tags": [
      "networking",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0075",
    "scenario": "Audit listening ports on db01",
    "codePattern": "ss listen",
    "example": "ssh db01.internal 'ss -tulpn'",
    "tags": [
      "security",
      "network"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0076",
    "scenario": "Check disk inode usage on db01",
    "codePattern": "df inodes",
    "example": "ssh db01.internal 'df -ih / /var'",
    "tags": [
      "devops",
      "disk"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0077",
    "scenario": "Capture brief perf sample on db01",
    "codePattern": "vmstat/iostat",
    "example": "ssh db01.internal 'vmstat 1 5; iostat -xm 1 3'",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0078",
    "scenario": "Measure packet loss to cache01 during outage",
    "codePattern": "mtr",
    "example": "mtr -rwzc 50 cache01.internal",
    "tags": [
      "networking",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0079",
    "scenario": "Audit listening ports on cache01",
    "codePattern": "ss listen",
    "example": "ssh cache01.internal 'ss -tulpn'",
    "tags": [
      "security",
      "network"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0080",
    "scenario": "Check disk inode usage on cache01",
    "codePattern": "df inodes",
    "example": "ssh cache01.internal 'df -ih / /var'",
    "tags": [
      "devops",
      "disk"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0081",
    "scenario": "Capture brief perf sample on cache01",
    "codePattern": "vmstat/iostat",
    "example": "ssh cache01.internal 'vmstat 1 5; iostat -xm 1 3'",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0082",
    "scenario": "Measure packet loss to kafka01 during outage",
    "codePattern": "mtr",
    "example": "mtr -rwzc 50 kafka01.internal",
    "tags": [
      "networking",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0083",
    "scenario": "Audit listening ports on kafka01",
    "codePattern": "ss listen",
    "example": "ssh kafka01.internal 'ss -tulpn'",
    "tags": [
      "security",
      "network"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0084",
    "scenario": "Check disk inode usage on kafka01",
    "codePattern": "df inodes",
    "example": "ssh kafka01.internal 'df -ih / /var'",
    "tags": [
      "devops",
      "disk"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0085",
    "scenario": "Capture brief perf sample on kafka01",
    "codePattern": "vmstat/iostat",
    "example": "ssh kafka01.internal 'vmstat 1 5; iostat -xm 1 3'",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0086",
    "scenario": "Measure packet loss to edge01 during outage",
    "codePattern": "mtr",
    "example": "mtr -rwzc 50 edge01.internal",
    "tags": [
      "networking",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0087",
    "scenario": "Audit listening ports on edge01",
    "codePattern": "ss listen",
    "example": "ssh edge01.internal 'ss -tulpn'",
    "tags": [
      "security",
      "network"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0088",
    "scenario": "Check disk inode usage on edge01",
    "codePattern": "df inodes",
    "example": "ssh edge01.internal 'df -ih / /var'",
    "tags": [
      "devops",
      "disk"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0089",
    "scenario": "Capture brief perf sample on edge01",
    "codePattern": "vmstat/iostat",
    "example": "ssh edge01.internal 'vmstat 1 5; iostat -xm 1 3'",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0090",
    "scenario": "Measure packet loss to bastion during outage",
    "codePattern": "mtr",
    "example": "mtr -rwzc 50 bastion.internal",
    "tags": [
      "networking",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0091",
    "scenario": "Audit listening ports on bastion",
    "codePattern": "ss listen",
    "example": "ssh bastion.internal 'ss -tulpn'",
    "tags": [
      "security",
      "network"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0092",
    "scenario": "Check disk inode usage on bastion",
    "codePattern": "df inodes",
    "example": "ssh bastion.internal 'df -ih / /var'",
    "tags": [
      "devops",
      "disk"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0093",
    "scenario": "Capture brief perf sample on bastion",
    "codePattern": "vmstat/iostat",
    "example": "ssh bastion.internal 'vmstat 1 5; iostat -xm 1 3'",
    "tags": [
      "performance",
      "linux"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0094",
    "scenario": "Parse access log field 1 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0095",
    "scenario": "Parse access log field 2 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $2}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0096",
    "scenario": "Parse access log field 3 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $3}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0097",
    "scenario": "Parse access log field 4 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $4}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0098",
    "scenario": "Parse access log field 5 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $5}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0099",
    "scenario": "Parse access log field 6 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $6}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0100",
    "scenario": "Parse access log field 7 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0101",
    "scenario": "Parse access log field 8 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $8}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0102",
    "scenario": "Parse access log field 9 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0103",
    "scenario": "Parse access log field 10 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $10}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0104",
    "scenario": "Parse access log field 11 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $11}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0105",
    "scenario": "Parse access log field 12 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $12}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0106",
    "scenario": "Parse access log field 13 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $13}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0107",
    "scenario": "Parse access log field 14 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $14}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0108",
    "scenario": "Parse access log field 15 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $15}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0109",
    "scenario": "Parse access log field 16 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $16}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0110",
    "scenario": "Parse access log field 17 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $17}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0111",
    "scenario": "Parse access log field 18 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $18}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0112",
    "scenario": "Parse access log field 19 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $19}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0113",
    "scenario": "Parse access log field 20 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $20}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0114",
    "scenario": "Parse access log field 21 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $21}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0115",
    "scenario": "Parse access log field 22 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $22}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0116",
    "scenario": "Parse access log field 23 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $23}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0117",
    "scenario": "Parse access log field 24 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $24}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0118",
    "scenario": "Parse access log field 25 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $25}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0119",
    "scenario": "Parse access log field 26 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $26}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0120",
    "scenario": "Parse access log field 27 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $27}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0121",
    "scenario": "Parse access log field 28 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $28}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0122",
    "scenario": "Parse access log field 29 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $29}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0123",
    "scenario": "Parse access log field 30 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $30}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0124",
    "scenario": "Parse access log field 31 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $31}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0125",
    "scenario": "Parse access log field 32 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $32}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0126",
    "scenario": "Parse access log field 33 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $33}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0127",
    "scenario": "Parse access log field 34 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $34}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0128",
    "scenario": "Parse access log field 35 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $35}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0129",
    "scenario": "Parse access log field 36 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $36}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0130",
    "scenario": "Parse access log field 37 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $37}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0131",
    "scenario": "Parse access log field 38 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $38}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "expert"
  },
  {
    "id": "scenario-0132",
    "scenario": "Parse access log field 39 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $39}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0133",
    "scenario": "Parse access log field 40 for anomaly detection",
    "codePattern": "awk uniq sort",
    "example": "awk '{print $40}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head",
    "tags": [
      "logs",
      "analytics"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0134",
    "scenario": "Export journal errors for day window 1",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-01 00:00:00' --until '2026-07-01 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0135",
    "scenario": "Export journal errors for day window 2",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-02 00:00:00' --until '2026-07-02 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0136",
    "scenario": "Export journal errors for day window 3",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-03 00:00:00' --until '2026-07-03 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0137",
    "scenario": "Export journal errors for day window 4",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-04 00:00:00' --until '2026-07-04 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0138",
    "scenario": "Export journal errors for day window 5",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-05 00:00:00' --until '2026-07-05 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0139",
    "scenario": "Export journal errors for day window 6",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-06 00:00:00' --until '2026-07-06 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0140",
    "scenario": "Export journal errors for day window 7",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-07 00:00:00' --until '2026-07-07 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0141",
    "scenario": "Export journal errors for day window 8",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-08 00:00:00' --until '2026-07-08 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0142",
    "scenario": "Export journal errors for day window 9",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-09 00:00:00' --until '2026-07-09 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0143",
    "scenario": "Export journal errors for day window 10",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-10 00:00:00' --until '2026-07-10 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0144",
    "scenario": "Export journal errors for day window 11",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-11 00:00:00' --until '2026-07-11 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0145",
    "scenario": "Export journal errors for day window 12",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-12 00:00:00' --until '2026-07-12 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0146",
    "scenario": "Export journal errors for day window 13",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-13 00:00:00' --until '2026-07-13 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0147",
    "scenario": "Export journal errors for day window 14",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-14 00:00:00' --until '2026-07-14 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0148",
    "scenario": "Export journal errors for day window 15",
    "codePattern": "journalctl export",
    "example": "journalctl --since '2026-07-15 00:00:00' --until '2026-07-15 23:59:59' -p err..alert --no-pager",
    "tags": [
      "logs",
      "linux",
      "incident"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0149",
    "scenario": "Validate terraform plan gate 1 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env1.tfvars -out=plan1.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0150",
    "scenario": "Validate terraform plan gate 2 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env2.tfvars -out=plan2.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0151",
    "scenario": "Validate terraform plan gate 3 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env3.tfvars -out=plan3.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0152",
    "scenario": "Validate terraform plan gate 4 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env4.tfvars -out=plan4.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0153",
    "scenario": "Validate terraform plan gate 5 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env5.tfvars -out=plan5.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0154",
    "scenario": "Validate terraform plan gate 6 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env6.tfvars -out=plan6.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0155",
    "scenario": "Validate terraform plan gate 7 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env7.tfvars -out=plan7.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0156",
    "scenario": "Validate terraform plan gate 8 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env8.tfvars -out=plan8.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0157",
    "scenario": "Validate terraform plan gate 9 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env9.tfvars -out=plan9.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0158",
    "scenario": "Validate terraform plan gate 10 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env10.tfvars -out=plan10.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0159",
    "scenario": "Validate terraform plan gate 11 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env11.tfvars -out=plan11.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0160",
    "scenario": "Validate terraform plan gate 12 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env12.tfvars -out=plan12.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0161",
    "scenario": "Validate terraform plan gate 13 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env13.tfvars -out=plan13.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0162",
    "scenario": "Validate terraform plan gate 14 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env14.tfvars -out=plan14.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0163",
    "scenario": "Validate terraform plan gate 15 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env15.tfvars -out=plan15.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0164",
    "scenario": "Validate terraform plan gate 16 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env16.tfvars -out=plan16.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0165",
    "scenario": "Validate terraform plan gate 17 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env17.tfvars -out=plan17.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0166",
    "scenario": "Validate terraform plan gate 18 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env18.tfvars -out=plan18.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0167",
    "scenario": "Validate terraform plan gate 19 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env19.tfvars -out=plan19.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0168",
    "scenario": "Validate terraform plan gate 20 before apply",
    "codePattern": "terraform plan",
    "example": "terraform plan -var-file=env20.tfvars -out=plan20.out",
    "tags": [
      "iac",
      "cicd"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "scenario-0169",
    "scenario": "Investigate S3 object access anomalies in bucket set 1",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-1/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0170",
    "scenario": "Investigate S3 object access anomalies in bucket set 2",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-2/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0171",
    "scenario": "Investigate S3 object access anomalies in bucket set 3",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-3/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0172",
    "scenario": "Investigate S3 object access anomalies in bucket set 4",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-4/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0173",
    "scenario": "Investigate S3 object access anomalies in bucket set 5",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-5/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0174",
    "scenario": "Investigate S3 object access anomalies in bucket set 6",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-6/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0175",
    "scenario": "Investigate S3 object access anomalies in bucket set 7",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-7/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0176",
    "scenario": "Investigate S3 object access anomalies in bucket set 8",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-8/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0177",
    "scenario": "Investigate S3 object access anomalies in bucket set 9",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-9/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0178",
    "scenario": "Investigate S3 object access anomalies in bucket set 10",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-10/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0179",
    "scenario": "Investigate S3 object access anomalies in bucket set 11",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-11/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0180",
    "scenario": "Investigate S3 object access anomalies in bucket set 12",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-12/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0181",
    "scenario": "Investigate S3 object access anomalies in bucket set 13",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-13/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0182",
    "scenario": "Investigate S3 object access anomalies in bucket set 14",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-14/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0183",
    "scenario": "Investigate S3 object access anomalies in bucket set 15",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-15/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0184",
    "scenario": "Investigate S3 object access anomalies in bucket set 16",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-16/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0185",
    "scenario": "Investigate S3 object access anomalies in bucket set 17",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-17/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0186",
    "scenario": "Investigate S3 object access anomalies in bucket set 18",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-18/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0187",
    "scenario": "Investigate S3 object access anomalies in bucket set 19",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-19/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0188",
    "scenario": "Investigate S3 object access anomalies in bucket set 20",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-20/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0189",
    "scenario": "Investigate S3 object access anomalies in bucket set 21",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-21/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0190",
    "scenario": "Investigate S3 object access anomalies in bucket set 22",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-22/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0191",
    "scenario": "Investigate S3 object access anomalies in bucket set 23",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-23/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0192",
    "scenario": "Investigate S3 object access anomalies in bucket set 24",
    "codePattern": "aws s3 ls + filter",
    "example": "aws s3 ls s3://audit-bucket-24/ --recursive --human-readable | tail -50",
    "tags": [
      "aws",
      "security",
      "cloud"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0193",
    "scenario": "Scan container image layer cache bloat slice 1",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=1 && NR<1+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0194",
    "scenario": "Scan container image layer cache bloat slice 2",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=2 && NR<2+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0195",
    "scenario": "Scan container image layer cache bloat slice 3",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=3 && NR<3+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0196",
    "scenario": "Scan container image layer cache bloat slice 4",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=4 && NR<4+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0197",
    "scenario": "Scan container image layer cache bloat slice 5",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=5 && NR<5+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0198",
    "scenario": "Scan container image layer cache bloat slice 6",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=6 && NR<6+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0199",
    "scenario": "Scan container image layer cache bloat slice 7",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=7 && NR<7+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0200",
    "scenario": "Scan container image layer cache bloat slice 8",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=8 && NR<8+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0201",
    "scenario": "Scan container image layer cache bloat slice 9",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=9 && NR<9+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0202",
    "scenario": "Scan container image layer cache bloat slice 10",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=10 && NR<10+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0203",
    "scenario": "Scan container image layer cache bloat slice 11",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=11 && NR<11+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  },
  {
    "id": "scenario-0204",
    "scenario": "Scan container image layer cache bloat slice 12",
    "codePattern": "docker system df",
    "example": "docker system df -v | awk 'NR>=12 && NR<12+6 {print}'",
    "tags": [
      "docker",
      "cicd"
    ],
    "difficulty": "advanced"
  }
];

fs.mkdirSync(dataDir, { recursive: true });
const enrichedCommands = commands.map(enrichCommand);
fs.writeFileSync(path.join(dataDir, 'commands.json'), JSON.stringify(enrichedCommands, null, 2));
fs.writeFileSync(path.join(dataDir, 'scenarios.json'), JSON.stringify(scenarios, null, 2));
console.log(`Generated ${enrichedCommands.length} commands and ${scenarios.length} scenarios`);
