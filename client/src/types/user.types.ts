import { IUser } from "./auth.types";

export interface UserResponse {
    user: IUser;
    message?: string;
}

export interface GetUsersResponse {
    users: IUser[];
    totalCount: number;
    succss: boolean;
}