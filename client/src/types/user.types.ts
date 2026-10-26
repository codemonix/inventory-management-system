import { IUser } from "./auth.types";

// A user as returned by the /users admin endpoints (raw document, so `_id` instead of `id`)
export interface IUserRecord extends Omit<IUser, 'id'> {
    _id: string;
}

export type UserUpdate = Partial<Pick<IUserRecord, 'name' | 'email' | 'role' | 'isActive' | 'isApproved'>>;

export interface UserResponse {
    success: boolean;
    user: IUserRecord;
    message?: string;
}

export interface GetUsersResponse {
    success: boolean;
    users: IUserRecord[];
    totalCount: number;
}
