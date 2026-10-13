# Database backups

A full copy of the EquineTrade database is saved **every night at about 2:00 AM (India time)**
by GitHub (`.github/workflows/db-backup.yml`). Each copy:

- contains every website table (listings, profiles, reports, logs and the rest, with their
  security rules and functions) and the login accounts;
- does **not** contain photos and videos (those are in Supabase Storage);
- is locked with the backup password (AES-256) before it is stored;
- is kept for **30 days** and then deleted automatically (this keeps the Privacy Policy
  promise that deleted accounts are gone within 30 days).

## Download a backup

1. GitHub → the repository → **Actions** → **Database backup**.
2. Open any run with a green tick → scroll to **Artifacts** → click the file name to download it.

## Make a backup right now

GitHub → **Actions** → **Database backup** → **Run workflow** → **Run workflow**.
Do this before any risky change (for example, before running a new SQL update).

## One-time setup (two secrets)

GitHub → the repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
| --- | --- |
| `SUPABASE_DB_URL` | Supabase → **Connect** → **Session pooler** connection string, with `[YOUR-PASSWORD]` replaced by the database password |
| `BACKUP_PASSWORD` | A long password you choose. **Store it safely (for example, in a password manager).** Without it, no backup can be opened. |

## Open a backup

On Windows, use **Git Bash** (installed with Git):

```bash
gpg --output backup.tar.gz --decrypt equinetrade-db-YYYY-MM-DD_HHMM.tar.gz.gpg   # asks for BACKUP_PASSWORD
tar -xzf backup.tar.gz    # gives public.dump, auth.dump and README.txt
```

## Restore (only in an emergency)

Restoring **replaces** the data in the database. Ideally do it with help, and into a **new**
Supabase project first, to check it. You need the PostgreSQL 17 tools (`pg_restore`).

```bash
# 1. Login accounts first (the website tables point to them)
pg_restore --data-only --no-owner --dbname="<connection string>" auth.dump

# 2. Then all website tables
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="<connection string>" public.dump
```

In a new project, also create the storage buckets again (the bucket parts of
`001_listings_and_media.sql` and `012_profile_photo_and_name_rules.sql`) and switch on the
same Authentication settings (Phone provider, Google provider, URL configuration).

To just **look inside** a backup without restoring anything:

```bash
pg_restore --file=public.sql public.dump   # turns it into a readable SQL file
```
