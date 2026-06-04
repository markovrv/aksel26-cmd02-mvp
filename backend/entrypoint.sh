#!/bin/sh
set -e

echo "🌱 Running database seed..."
node src/db/seeds.js

echo "🚀 Starting server..."
exec "$@"