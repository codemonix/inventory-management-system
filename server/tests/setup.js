import mongoose from 'mongoose';
import { startMongoMemoryServer, stopMongoMemoryServer } from './mongoServer';


beforeAll( async () => {

    const mongo = await startMongoMemoryServer();
    const uri = mongo.getUri();

    console.log("MongoMemoryServer running at", uri);

    if (!uri.startsWith("mongodb://127.0.0.1") && !uri.startsWith("mongodb://localhost")) {
        throw new Error(`Unsafe DB URI detected: ${uri}`);
        }
    const conn = await mongoose.connect(uri);
    console.log("connection:", conn.connection.readyState);

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }

    await mongoose.connect(uri);
    
});


afterAll( async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await stopMongoMemoryServer();
});