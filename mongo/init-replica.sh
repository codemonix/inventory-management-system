#!/bin/sh
# One-shot init, run by the mongo-init compose service (idempotent, safe on every start):
#   1. initiates the rs0 replica set (MongoDB transactions require one)
#   2. creates the application user with readWrite on the app database only
set -e

mongosh --quiet --host ims_mongo:27017 \
  -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin \
  --eval '
    try {
      rs.status();
      print("Replica set already initiated");
    } catch (e) {
      rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "ims_mongo:27017" }] });
      print("Replica set initiated");
    }

    // Wait until this node is primary before creating users
    for (let i = 0; i < 30 && !db.hello().isWritablePrimary; i++) sleep(1000);

    const appDb = db.getSiblingDB(process.env.MONGO_APP_DB);
    if (!appDb.getUser(process.env.MONGO_APP_USERNAME)) {
      appDb.createUser({
        user: process.env.MONGO_APP_USERNAME,
        pwd: process.env.MONGO_APP_PASSWORD,
        roles: [{ role: "readWrite", db: process.env.MONGO_APP_DB }],
      });
      print("Application user created");
    } else {
      print("Application user already exists");
    }
  '
