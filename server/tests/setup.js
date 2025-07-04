import mongoose from 'mongoose';
import { startMongoMemoryServer, stopMongoMemoryServer } from './mongoServer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test'});

let mongo;

beforeAll( async () => {
    let uri;

    // const mongo = await startMongoMemoryServer();
    // const uri = mongo.getUri();
    console.log(process.env.JWT_SECRET);
    console.log(process.env.MONGO_URI);
    if (process.env.MONGO_URI) {
        uri = process.env.MONGO_URI;
        console.log("Using external Mongo URI:", uri);
    } else {
        mongo = await startMongoMemoryServer();
        uri = mongo.getUri();
        console.log("Using in-memory MongoDB:", uri);
    }

    console.log("MongoMemoryServer running at", uri);

    if (!uri.startsWith("mongodb://127.0.0.1") && !uri.startsWith("mongodb://localhost")) {
        throw new Error(`Unsafe DB URI detected: ${uri}`);
        }

    console.log(" before conn!!")
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