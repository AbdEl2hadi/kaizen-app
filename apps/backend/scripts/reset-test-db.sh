#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

goose -dir migrations postgres "postgres://test:test@localhost:5433/kaizen_test?sslmode=disable" down-to 0
goose -dir migrations postgres "postgres://test:test@localhost:5433/kaizen_test?sslmode=disable" up
