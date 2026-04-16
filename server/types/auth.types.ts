import { Request } from "express";
import { IUser } from "./user.types.js";
import { JwtPayload } from "jsonwebtoken";

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved?: boolean;
}

export interface AuthResponse {
    user: SafeUser;
    token: string;
}

export interface UserResponse {
    user: SafeUser;
}

export interface AuthenticatedRequest<
    P = any,
    ResBosy = any,
    ReqBody = any,
    ReqQuery = any,
    > extends Request<P, ResBosy, ReqBody, ReqQuery> {
    user: IUser;
}

export interface DecodedToken extends JwtPayload {
    id: string;
    role: string;
}

export type UserRole = 'admin' | 'manager' | 'user';

export interface ITokenPayload {
    id: string;
    role: UserRole;
}; 