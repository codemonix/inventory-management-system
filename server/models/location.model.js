import mongoose from 'mongoose';


const locationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        type: { type: String, enum: ['Istanbul', 'Mashhad', 'Kargo']},
    },
    { timestamp: true },
);

const Location = new mongoose.model('Location', locationSchema);
export default Location;