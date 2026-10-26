import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';

export const assertObjectId = (value: unknown, fieldName: string): string => {
    if (typeof value !== 'string' || !mongoose.Types.ObjectId.isValid(value)) {
        throw new AppError(`Invalid ${fieldName}`, 400);
    }
    return value;
};

// Quantities must be whole, positive numbers. Rejects NaN, 0, negatives and fractions.
export const parsePositiveInt = (value: unknown, fieldName = 'quantity'): number => {
    const num = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    if (typeof num !== 'number' || !Number.isInteger(num) || num <= 0) {
        throw new AppError(`${fieldName} must be a positive whole number`, 400);
    }
    return num;
};

export const escapeRegex = (str: string): string => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

export const searchRegex = (search: unknown): { $regex: string; $options: string } | null => {
    if (typeof search !== 'string' || !search.trim()) return null;
    return { $regex: escapeRegex(search.trim().slice(0, 100)), $options: 'i' };
};

// Parses "field_dir" (e.g. "name_desc") and only allows whitelisted fields.
export const parseSort = (
    sortParam: unknown,
    allowedFields: readonly string[],
    fallback: Record<string, 1 | -1>,
): Record<string, 1 | -1> => {
    if (typeof sortParam !== 'string') return fallback;
    const separator = sortParam.lastIndexOf('_');
    const field = separator === -1 ? sortParam : sortParam.slice(0, separator);
    const direction = separator === -1 ? 'asc' : sortParam.slice(separator + 1);
    if (!allowedFields.includes(field)) return fallback;
    return { [field]: direction === 'desc' ? -1 : 1 };
};

export const parsePagination = (
    pageParam: unknown,
    limitParam: unknown,
    defaultLimit = 20,
    maxLimit = 100,
): { page: number; limit: number } => {
    const page = Math.max(1, parseInt(String(pageParam ?? ''), 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(String(limitParam ?? ''), 10) || defaultLimit));
    return { page, limit };
};

// "id1,id2,..." -> validated, de-duplicated ObjectId strings (max `max` entries)
export const parseIdList = (value: unknown, fieldName: string, max = 100): string[] => {
    if (value === undefined || value === '') return [];
    const ids = [...new Set(String(value).split(',').map(id => id.trim()).filter(Boolean))];
    if (ids.length > max) throw new AppError(`At most ${max} ${fieldName} are allowed`, 400);
    return ids.map(id => assertObjectId(id, fieldName));
};
