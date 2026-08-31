#!/bin/bash

set -e

# Pushes the server/ subtree to Dokku, which builds the image on the host.
# Config (secrets, DATABASE_URL, REDIS_URL) lives in `dokku config` on the
# server, not in the image — nothing here reads a local .env file.

REMOTE_URL="dokku@163.192.9.74:api"

cd "$(dirname "$0")/.."

git remote add dokku "$REMOTE_URL" 2>/dev/null || git remote set-url dokku "$REMOTE_URL"

git subtree push --prefix=server dokku master
