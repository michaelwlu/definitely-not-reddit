#!/bin/bash
#
# Weekly restore test for the off-host backups.
#
# Downloads the newest dump *from Object Storage* (not the local copy, which is
# not the copy at risk), restores it into a throwaway database, and checks the
# tables are there and populated. Proves the remote backup is restorable, which
# a checksum alone does not.
#
# Reports to its own Healthchecks.io check, separate from the nightly backup's,
# so "backups are being written" and "backups can actually be restored" fail
# independently and are legible apart from each other.
#
# Installed at /usr/local/bin/dokku-db-verify.sh, run weekly from root's crontab.

set -uo pipefail

SERVICE="api-db"
DEST="/var/backups/dokku"
READ_PAR_FILE="/etc/dokku-db-backup-read.par"
HC_FILE="/etc/dokku-db-verify-healthcheck.url"
CONTAINER="dokku.postgres.${SERVICE}"
SCRATCH="restore_verify"
TABLES=(user post comment link upvote migrations)

HC=""
[ -r "$HC_FILE" ] && HC="$(tr -d '[:space:]' < "$HC_FILE")"
hc() { [ -n "$HC" ] || return 0; curl -fsS -m 10 --retry 3 -o /dev/null "$@" || true; }

drop_scratch() {
  docker exec "$CONTAINER" psql -U postgres -q -c "DROP DATABASE IF EXISTS $SCRATCH;" >/dev/null 2>&1 || true
}

# Deliberately not `local`: the EXIT trap below runs after main() has returned,
# when a local would already be out of scope and `set -u` would abort.
TMP=""

main() {
  set -e
  local NAME RPAR CODE COUNTS n

  [ -r "$READ_PAR_FILE" ] || { echo "VERIFY FAILED: no read PAR at $READ_PAR_FILE"; return 1; }

  # The object name matches the newest local dump; that is how the uploader
  # names them, so no bucket listing permission is needed.
  NAME="$(ls -t "$DEST"/${SERVICE}-*.dump 2>/dev/null | head -1 | xargs -r basename)"
  [ -n "$NAME" ] || { echo "VERIFY FAILED: no local dump to derive the object name from"; return 1; }

  RPAR="$(tr -d '[:space:]' < "$READ_PAR_FILE")"
  TMP="$(mktemp)"
  trap 'rm -f "$TMP"; drop_scratch' EXIT

  CODE="$(curl -sS -o "$TMP" -w '%{http_code}' --max-time 300 "${RPAR}${NAME}" || echo 000)"
  [ "${CODE:0:1}" = "2" ] || { echo "VERIFY FAILED: download of $NAME returned $CODE"; return 1; }
  [ "$(head -c 5 "$TMP")" = "PGDMP" ] || { echo "VERIFY FAILED: $NAME is not a pg_dump archive"; return 1; }

  # Restore into a scratch database. Never touches api_db.
  drop_scratch
  docker exec "$CONTAINER" psql -U postgres -q -c "CREATE DATABASE $SCRATCH;"
  docker exec -i "$CONTAINER" pg_restore -U postgres -d "$SCRATCH" --no-owner < "$TMP" \
    || { echo "VERIFY FAILED: pg_restore of $NAME failed"; return 1; }

  # Assert structure and non-emptiness rather than equality with live: live
  # drifts between the dump and this check, so equality would raise false alarms.
  COUNTS=""
  for t in "${TABLES[@]}"; do
    n="$(docker exec "$CONTAINER" psql -U postgres -d "$SCRATCH" -t -A \
          -c "SELECT COUNT(*) FROM \"$t\";" 2>/dev/null)" \
      || { echo "VERIFY FAILED: table \"$t\" missing from $NAME"; return 1; }
    COUNTS="$COUNTS $t=$n"
    if [ "$t" = "user" ] && [ "$n" -eq 0 ]; then
      echo "VERIFY FAILED: restored \"user\" table is empty in $NAME"
      return 1
    fi
  done

  echo "VERIFY OK $NAME restored cleanly;$COUNTS"
  return 0
}

OUTPUT="$(main 2>&1)"
RC=$?

echo "$(date -Is) $OUTPUT"

hc --data-raw "$OUTPUT" "$HC/$RC"

exit "$RC"
