import mongoose from 'mongoose';
import { type } from 'os';

const storageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ['Istanbul', 'Mashhad', 'Kargo']},
    },
    { timestamp: true },
);

const Storage = new mongoose.model('Storage', storageSchema);
export default Storage;