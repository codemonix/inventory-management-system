import User from "../models/users.model.js";
import { AppError } from "../errors/AppError.js";
import { IUpdateUserBody, IUser } from "../types/user.types.js";
import { UserRole } from "../types/auth.types.js";
import logger from "../utils/logger.js";
import { parseSort, searchRegex } from "../utils/validation.js";

interface IGetUsersParams {
    page: number;
    limit: number;
    search: string;
    sortParam: string;
}

const USER_SORT_FIELDS = ['name', 'email', 'role', 'isActive', 'isApproved', 'lastLogin', 'createdAt'] as const;
const ROLES: readonly UserRole[] = ['admin', 'manager', 'user'];

export const getUsers = async ({ page, limit, search, sortParam }: IGetUsersParams) => {
    const regex = searchRegex(search);
    const query = regex ? { $or: [{ name: regex }, { email: regex }] } : {};

    const totalCount = await User.countDocuments(query);

    const users = await User.find(query)
        .sort(parseSort(sortParam, USER_SORT_FIELDS, { name: 1 }))
        .skip((page - 1) * limit)
        .limit(limit);

    return { users, totalCount };
};

// Managers may only manage regular users; nobody may lock themselves out.
const assertCanModify = async (actor: IUser, targetId: string, lockingOut: boolean) => {
    const target = await User.findById(targetId);
    if (!target) {
        logger.warn("User not found")
        throw new AppError("User not found", 404);
    }
    if (actor.role !== 'admin' && target.role !== 'user') {
        throw new AppError("Managers can only modify regular users", 403);
    }
    if (lockingOut && actor._id.equals(target._id)) {
        throw new AppError("You cannot deactivate or unapprove your own account", 400);
    }
    return target;
};

export const toggleUserActive = async (actor: IUser, id: string, isActive: boolean) => {
    const user = await assertCanModify(actor, id, !isActive);
    user.isActive = isActive;
    return await user.save();
};

export const updateUser = async (actor: IUser, id: string, data: Partial<IUpdateUserBody>) => {
    if (data.role !== undefined && !ROLES.includes(data.role as UserRole)) {
        throw new AppError("Invalid role", 400);
    }
    const lockingOut = data.isActive === false || data.isApproved === false
        || (data.role !== undefined && data.role !== 'admin');
    const user = await assertCanModify(actor, id, lockingOut);

    const allowed: (keyof IUpdateUserBody)[] = ['name', 'email', 'role', 'isActive', 'isApproved'];
    for (const key of allowed) {
        if (data[key] !== undefined) user.set(key, data[key]);
    }
    return await user.save();
};

export const toggleUserApproved = async (actor: IUser, id: string, isApproved: boolean) => {
    logger.debug("toggleUserApproved for ID:", id);
    const user = await assertCanModify(actor, id, !isApproved);
    user.isApproved = isApproved;
    return await user.save();
};
