# Replit PostgreSQL runbook

The database connection stays in Replit Secrets as `DATABASE_URL`. Never put it
in GitHub, a backup filename, or an application log.

Run these commands in the Replit shell after a deployment:

1. `npm run db:migrate` applies the current schema.
2. `npm run db:verify` confirms the database and required play-cash tables are available.
3. Set `WEPARLAY_BACKUP_DIR` to a private persistent directory outside the repository, then run `npm run db:backup`.

The backup command produces a JSON snapshot and SHA-256 checksum. Store both in
private storage. To verify recovery, restore a copy only into a separate
non-production PostgreSQL database, run `npm run db:verify` there, and confirm
the expected record counts before considering the backup usable.
