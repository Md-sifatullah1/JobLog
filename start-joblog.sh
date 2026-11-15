
#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "================================="
echo "       Starting JobLog"
echo "================================="

# Check required tools
for command in node npm java pg_isready; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Error: $command is not installed or not in PATH."
        exit 1
    fi
done

# Check PostgreSQL
echo "Checking PostgreSQL..."

if ! pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
    echo "PostgreSQL is not running."
    echo "Start PostgreSQL and try again."
    exit 1
fi

# Check database password

# Load database password from macOS Keychain
if [ -z "${DB_PASSWORD:-}" ]; then
    DB_PASSWORD="$(security find-generic-password \
        -a "$USER" \
        -s "JobLog-PostgreSQL" \
        -w 2>/dev/null)" || {
        echo "Error: Could not retrieve password from Keychain."
        exit 1
    }

    export DB_PASSWORD
fi



# Build Angular only when needed
STATIC_DIR="$PROJECT_DIR/backend/src/main/resources/static"
BUILD_DIR="$PROJECT_DIR/dist/JobLog/browser"

NEEDS_BUILD=false

if [ ! -f "$STATIC_DIR/index.html" ]; then
    NEEDS_BUILD=true
elif find "$PROJECT_DIR/src" "$PROJECT_DIR/public" \
    -type f -newer "$STATIC_DIR/index.html" \
    -print -quit | grep -q .; then
    NEEDS_BUILD=true
elif [ "$PROJECT_DIR/angular.json" -nt "$STATIC_DIR/index.html" ] ||
     [ "$PROJECT_DIR/package.json" -nt "$STATIC_DIR/index.html" ] ||
     [ "$PROJECT_DIR/package-lock.json" -nt "$STATIC_DIR/index.html" ]; then
    NEEDS_BUILD=true
fi

if [ "$NEEDS_BUILD" = true ]; then
    echo "Frontend changes detected. Building Angular..."
    npm run build

    if [ ! -f "$BUILD_DIR/index.html" ]; then
        echo "Error: Angular build output not found."
        exit 1
    fi

    mkdir -p "$STATIC_DIR"
    find "$STATIC_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    cp -R "$BUILD_DIR/." "$STATIC_DIR/"
else
    echo "Frontend unchanged. Skipping Angular build."
fi

# Copy Angular into Spring Boot
echo "Preparing frontend files..."

STATIC_DIR="$PROJECT_DIR/backend/src/main/resources/static"
BUILD_DIR="$PROJECT_DIR/dist/JobLog/browser"

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "Error: Angular build output not found."
    exit 1
fi

mkdir -p "$STATIC_DIR"

# Remove previous generated frontend files
find "$STATIC_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

cp -R "$BUILD_DIR/." "$STATIC_DIR/"

# Start Spring Boot
echo "Starting Spring Boot..."
echo "JobLog will be available at http://localhost:8080"

cd "$PROJECT_DIR/backend"
exec ./mvnw spring-boot:run
