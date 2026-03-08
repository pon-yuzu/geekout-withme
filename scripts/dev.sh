#!/bin/bash
# Load secrets from ~/.geekout-dev-vars and run wrangler pages dev
# .dev.vars is NOT kept in the project directory for security.

SECRETS_FILE="$HOME/.geekout-dev-vars"

if [ ! -f "$SECRETS_FILE" ]; then
  echo "ERROR: $SECRETS_FILE not found."
  echo "Move your .dev.vars there:  mv .dev.vars ~/.geekout-dev-vars"
  exit 1
fi

set -a
source "$SECRETS_FILE"
set +a

exec npx wrangler pages dev --compatibility-date=2025-01-01 --compatibility-flags=nodejs_compat "$@"
