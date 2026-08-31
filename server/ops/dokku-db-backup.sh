#!/bin/bash
#
# Daily Postgres backup for the Dokku `api` app.
#
# Writes a pg_dump custom-format file (restore with pg_restore, not psql),
# keeps a local copy for KEEP_DAYS, uploads to Oracle Object Storage via a
# write-only pre-authenticated request, and reads the object back to confirm
# the stored bytes match.
#
# Reports to Healthchecks.io so that silence is the alarm: if this stops
# running at all, the check goes red on its own.
#
# Installed at /usr/local/bin/dokku-db-backup.sh, run from root's crontab.
# Credentials, all root-owned mode 600:
#   /etc/dokku-db-backup.par        write PAR
#   /etc/dokku-db-backup-read.par   read PAR
#   /etc/dokku-db-healthcheck.url   Healthchecks.io ping URL

set -uo pipefail

SERVICE="api-db"
DEST="/var/backups/dokku"
PAR_FILE="/etc/dokku-db-backup.par"
READ_PAR_FILE="/etc/dokku-db-backup-read.par"
HC_FILE="/etc/dokku-db-healthcheck.url"
KEEP_DAYS=30

HC=""
[ -r "$HC_FILE" ] && HC="$(tr -d '[:space:]' < "$HC_FILE")"

# Never let a ping failure affect the backup result.
hc() { [ -n "$HC" ] || return 0; curl -fsS -m 10 --retry 3 -o /dev/null "$@" || true; }

# Deliberately not `local`: the EXIT trap below runs after main() has returned,
# when a local would already be out of scope and `set -u` would abort.
TMP=""

main() {
  set -e
  local STAMP NAME OUT CODE UPLOAD RC RPAR BACK
  STAMP="$(date +%F-%H%M)"
  NAME="${SERVICE}-${STAMP}.dump"
  OUT="$DEST/$NAME"

  mkdir -p "$DEST"

  # Write to a temp file first so a failed or partial dump never lands under
  # the real name and get mistaken for a good backup.
  TMP="$(mktemp "$DEST/.${SERVICE}-XXXXXX")"
  trap 'rm -f "$TMP"' EXIT

  /usr/bin/dokku postgres:export "$SERVICE" > "$TMP"

  # pg_dump custom format starts with the magic bytes "PGDMP". Without them the
  # file is not a usable dump, whatever its size.
  if [ "$(head -c 5 "$TMP")" != "PGDMP" ]; then
    echo "FAILED: dump output is not a pg_dump archive"
    return 1
  fi

  mv "$TMP" "$OUT"
  trap - EXIT
  chmod 600 "$OUT"

  find "$DEST" -name "${SERVICE}-*.dump" -mtime +"$KEEP_DAYS" -delete

  # Off-host copy. A PAR expires on a fixed date, and an expired one fails every
  # night from then on, so treat any non-2xx as a hard error.
  UPLOAD="skipped (no PAR file)"
  RC=0
  if [ -r "$PAR_FILE" ]; then
    PAR="$(tr -d '[:space:]' < "$PAR_FILE")"
    CODE="$(curl -sS -o /dev/null -w '%{http_code}' \
              --max-time 300 --retry 3 --retry-delay 10 \
              -X PUT --data-binary "@$OUT" "${PAR}${NAME}" || echo 000)"
    case "$CODE" in
      2*)          UPLOAD="uploaded ($CODE)" ;;
      401|403|404) UPLOAD="FAILED ($CODE) - PAR expired, revoked, or bucket gone; recreate it and rewrite $PAR_FILE"; RC=1 ;;
      000)         UPLOAD="FAILED (no response) - network or timeout"; RC=1 ;;
      *)           UPLOAD="FAILED ($CODE)"; RC=1 ;;
    esac

    # A 2xx says the request was accepted, not that the stored bytes are the
    # bytes we sent. Read it back and compare digests.
    if [ "$RC" -eq 0 ] && [ -r "$READ_PAR_FILE" ]; then
      RPAR="$(tr -d '[:space:]' < "$READ_PAR_FILE")"
      BACK="$(mktemp)"
      if curl -sS -o "$BACK" --max-time 300 "${RPAR}${NAME}" \
         && [ "$(sha256sum < "$BACK" | cut -d' ' -f1)" = "$(sha256sum < "$OUT" | cut -d' ' -f1)" ]; then
        UPLOAD="$UPLOAD verified=sha256-match"
      else
        UPLOAD="$UPLOAD verified=MISMATCH - stored copy differs from local dump"
        RC=1
      fi
      rm -f "$BACK"
    fi
  fi

  echo "local=OK $OUT ($(stat -c%s "$OUT") bytes, $(find "$DEST" -name "${SERVICE}-*.dump" | wc -l) kept) remote=$UPLOAD"
  return "$RC"
}

hc "$HC/start"

OUTPUT="$(main 2>&1)"
RC=$?

echo "$(date -Is) $OUTPUT"

# Healthchecks reads the trailing path as the exit status: 0 succeeds, anything
# else fails the check. The body shows up in the check's event log.
hc --data-raw "$OUTPUT" "$HC/$RC"

exit "$RC"
