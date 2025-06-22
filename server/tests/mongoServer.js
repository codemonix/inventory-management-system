import { MongoMemoryServer } from "mongodb-memory-server";


let mongo = null;

export async function startMongoMemoryServer() {
    if (!mongo) {
        mongo = await MongoMemoryServer.create();
    }
    return mongo;
}

export async function stopMongoMemoryServer() {
    if (mongo) {
        await mongo.stop();
        mongo = null;
    }
}