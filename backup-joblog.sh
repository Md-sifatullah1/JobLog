
#!/bin/bash

set -euo pipefail
umask 077

BACKUP_DIR="$HOME/JobLog-backups"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
BACKUP_FILE="$BACKUP_DIR/joblog-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

echo "Backing up JobLog database..."

if [ -z "${PGPASSWORD:-}" ]; then
    PGPASSWORD="$(security find-generic-password \
        -a "$USER" \
        -s "JobLog-PostgreSQL" \
        -w)" || {
        echo "Error: Could not retrieve password from Keychain."
        exit 1
    }
    export PGPASSWORD
fi

pg_dump \
    -h 127.0.0.1 \
    -p 5432 \
    -U joblog_app \
    -d joblog \
    -Fc \
    -f "$BACKUP_FILE"

echo "Backup created:"
ls -lh "$BACKUP_FILE"

echo "Checking backup archive..."
pg_restore --list "$BACKUP_FILE" >/dev/null

echo "Backup archive is readable."
