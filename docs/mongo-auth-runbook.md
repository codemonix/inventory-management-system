# MongoDB authentication: setup and migration runbook

The compose files now start MongoDB with authentication and a replica-set keyfile.
The backend connects as a least-privilege user (`readWrite` on the app database only).

- **New install (empty volume):** do the "Prepare secrets" steps, then `docker compose up -d`. Mongo creates the root
  user on first boot, and the `mongo-init` service initiates the replica set and creates the app user.
- **Existing production server (data already in `mongo_data`):** Mongo only creates the root user on an *empty*
  volume, so follow every step below **before** deploying the new `docker-compose.ims.yml`.

Run everything from the folder holding `docker-compose.ims.yml` on the server.

## 1. Back up first

In the app: **Manage → System → Download backup**. Also take a raw dump:

```bash
docker exec ims_mongo mongodump --archive=/data/db/pre-auth.archive
docker cp ims_mongo:/data/db/pre-auth.archive ./pre-auth.archive
```

## 2. Prepare secrets

```bash
# Compose variables (passwords must be URL-safe: letters, digits, - _ .)
cp .env.example .env
nano .env        # set MONGO_ROOT_*, MONGO_APP_*

# Replica-set keyfile: must be readable only by the mongodb user (uid 999)
mkdir -p mongo
openssl rand -base64 756 > mongo/keyfile
sudo chown 999:999 mongo/keyfile
sudo chmod 400 mongo/keyfile
```

Also copy `mongo/init-replica.sh` from the repository to `./mongo/init-replica.sh` on the server.

`.env.backend` keeps `JWT_SECRET` (and optionally `DEFAULT_USER_APPROVED`, `CORS_ORIGIN`). Remove any `DB_URI` from it:
compose now builds `DB_URI` from the app credentials.

## 3. Create the root user on the existing data

Mongo is still running **without** auth at this point (the old compose file):

```bash
source .env
docker exec -i ims_mongo mongosh --quiet --eval "
  db.getSiblingDB('admin').createUser({
    user: '$MONGO_ROOT_USERNAME',
    pwd: '$MONGO_ROOT_PASSWORD',
    roles: [{ role: 'root', db: 'admin' }]
  })"
```

## 4. Let the backend (non-root) write uploads

The backend image now runs as uid 1000 (`node`) instead of root:

```bash
sudo chown -R 1000:1000 ./uploads
```

## 5. Deploy

```bash
docker compose -f docker-compose.ims.yml pull
docker compose -f docker-compose.ims.yml up -d
docker logs ims_mongo_init     # expect "Replica set already initiated" and "Application user created"
docker logs ims_backend        # expect "MongoDB connected successfully"
```

## 6. Verify

- Logging in at https://ims.saeidmon.com works.
- An unauthenticated connection is refused:
  `docker exec ims_mongo mongosh --quiet --eval "db.getSiblingDB('ims').items.countDocuments()"` → `requires authentication`.
- `curl -s http://<server-public-ip>:5000/` from another machine fails (the backend now listens on 127.0.0.1 only).

## Rollback

Revert to the previous `docker-compose.ims.yml` and `docker compose up -d`. The root user stays in the database
but is unused while auth is off. To restore data, use `mongorestore --archive` on the dump from step 1.
