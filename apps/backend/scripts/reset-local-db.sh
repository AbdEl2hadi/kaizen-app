#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

goose -dir migrations postgres "postgres://postgres:local_password123@localhost:5432/kaizen_dev?sslmode=disable" down-to 0
goose -dir migrations postgres "postgres://postgres:local_password123@localhost:5432/kaizen_dev?sslmode=disable" up
