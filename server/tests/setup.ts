// Shared test setup: an in-memory MongoDB, wiped after every test.
import { MongoMemoryReplSet } from 'mongodb-memory-server'; 
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryReplSet; 

beforeAll(async () => {
    process.env.JWT_SECRET = 'super-secret-test-key';
    process.env.NODE_ENV = 'test';

    // A single-node replica set, because the services use MongoDB transactions
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});