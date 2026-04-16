// server/test/setup.ts
// 1. IMPORT REPLSET INSTEAD OF SERVER
import { MongoMemoryReplSet } from 'mongodb-memory-server'; 
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

// 2. CHANGE THE VARIABLE TYPE
let mongoServer: MongoMemoryReplSet; 

beforeAll(async () => {
    process.env.JWT_SECRET = 'super-secret-test-key';
    process.env.NODE_ENV = 'test';

    // 3. THE ENTERPRISE FIX: Boot a 1-node Replica Set so Transactions work!
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