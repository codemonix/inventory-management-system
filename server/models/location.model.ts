import mongoose, { Schema } from 'mongoose';
import { ILocation } from '../types/location.types.js';


const locationSchema = new Schema<ILocation>(
    {
        name: { type: String, required: true, unique: true },
        color: { type: String, default: '#fff'},
        type: { type: String },
    },
    { timestamps: true },
);

const Location = mongoose.model<ILocation>('Location', locationSchema);
export default Location;