# Backup operations

Scripts that run on the Dokku host (Oracle Cloud, `ubuntu@163.192.9.74`). They
live here so the logic is version-controlled; the credentials they read do not
and must never be committed.

## What runs

| Script | Schedule (UTC) | Does |
| --- | --- | --- |
| `dokku-db-backup.sh` | daily 03:30 | Dumps `api-db`, keeps 30 days locally, uploads to Object Storage, reads the object back and compares SHA256 |
| `dokku-db-verify.sh` | Sundays 04:15 | Downloads the newest dump **from Object Storage**, restores it into a throwaway database, asserts every table is present and `user` is non-empty |

The verify job deliberately pulls from the bucket rather than from disk: the
local copy is not the one at risk, so testing it proves nothing about the
copy you would actually restore from.

Each reports to its own Healthchecks.io check, pinging `$URL/start` on entry
and `$URL/<exit-code>` on exit, with the log line as the request body.
Separate checks because the two failures mean different things: a red *backup*
check means new data is not being saved; a red *verify* check means what has
been saved may not come back.

## Credential files (host only, root:root, mode 600)

| Path | Contents |
| --- | --- |
| `/etc/dokku-db-backup.par` | Object Storage PAR, **object writes only** |
| `/etc/dokku-db-backup-read.par` | Object Storage PAR, **object reads only** |
| `/etc/dokku-db-healthcheck.url` | Healthchecks.io ping URL for the backup job |
| `/etc/dokku-db-verify-healthcheck.url` | Healthchecks.io ping URL for the verify job |

Both scripts degrade rather than crash when a file is missing: no PAR means
local-only backups, no ping URL means no reporting.

## Installing on a fresh host

```sh
sudo install -m 755 -o root -g root dokku-db-backup.sh /usr/local/bin/
sudo install -m 755 -o root -g root dokku-db-verify.sh /usr/local/bin/

# then create the four credential files above, e.g.
printf '%s' 'https://objectstorage.../o/' | sudo tee /etc/dokku-db-backup.par >/dev/null
sudo chmod 600 /etc/dokku-db-backup.par

sudo crontab -e   # add:
# 30 3 * * * /usr/local/bin/dokku-db-backup.sh >> /var/log/dokku-db-backup.log 2>&1
# 15 4 * * 0 /usr/local/bin/dokku-db-verify.sh >> /var/log/dokku-db-backup.log 2>&1
```

Creating the PARs: bucket → Resources → Pre-Authenticated Requests → Create,
type **Bucket**, one with *Permit object writes* and one with *Permit object
reads*, object listing left off. The URL is shown once. Note the expiry dates —
when a PAR lapses both jobs fail with 401 and the checks go red.

## Restoring

The dumps are pg_dump custom format, so `pg_restore`, not `psql`:

```sh
# from a local dump on the host
sudo cat /var/backups/dokku/api-db-YYYY-MM-DD-HHMM.dump \
  | sudo docker exec -i dokku.postgres.api-db pg_restore -U postgres -d api_db --no-owner --clean

# or fetch from the bucket first
curl -o restore.dump "$(sudo cat /etc/dokku-db-backup-read.par)api-db-YYYY-MM-DD-HHMM.dump"
```

Restore into a scratch database first and check row counts before pointing
anything at it. `dokku-db-verify.sh` does exactly this every week and is the
working example.

## Known gaps

- **One credential domain.** The instance and the bucket are both under the
  same Oracle account; losing the account loses both copies.
- **PAR expiry is load-bearing.** Nothing renews them automatically.
- **`set -u` and EXIT traps.** Both scripts declare `TMP` at script scope, not
  `local`, because the trap fires after `main()` returns — when a local would
  be out of scope and `set -u` would abort. That bug shipped once and made
  `dokku-db-verify.sh` exit 1 while printing `VERIFY OK`.
