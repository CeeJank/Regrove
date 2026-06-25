#!/bin/sh
set -e

echo "Restoring Dell full schema backup..."
pg_restore \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --no-owner \
  --no-privileges \
  /db-assets/Dell_full_schema.backup

USER_COUNT=$(psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --tuples-only \
  --no-align \
  --command "SELECT COUNT(*) FROM public.users;")

if [ "$USER_COUNT" = "0" ]; then
  echo "Backup has no seed users. Loading Regrove mock data..."
  psql \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --set ON_ERROR_STOP=on \
    --file /db-assets/regrove_mock_db.sql
else
  echo "Backup already contains seed data. Skipping regrove_mock_db.sql."
fi

echo "Dell database initialization complete."
