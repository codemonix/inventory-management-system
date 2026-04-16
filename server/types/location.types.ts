import mongoose, { Document } from "mongoose";

export interface ILocation extends Document {
    name: string;
    type?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateLocationInput {
    name: string;
    type?: string;
}

export interface IDeleteLocationInput {
    id: string;
    userId: string | mongoose.Types.ObjectId;
}
