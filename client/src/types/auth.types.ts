
export type UserRole = 'admin' | 'manager' | 'user';

export interface IUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    isApproved: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AuthResponse {
    user: IUser;
    token?: string;   // omitted after registration until the account is approved
}

export interface MeResponse {
    user: IUser;
}