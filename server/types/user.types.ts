import { Document, Types } from "mongoose";
import { UserRole } from "./auth.types.js";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    isActive: boolean;
    isApproved: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}


export interface IUserQuery {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
}

export interface IUpdateUserBody {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isApproved: boolean;
}

export interface IToggleActiveBody {
    isActive: boolean;
}

export interface IToggleApprovedBody {
    isApproved: boolean;
}