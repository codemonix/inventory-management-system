import logger from "./logger.js";

// Values MongoDB accepts for sorting
export type SortOrder = 1 | -1;

// The return object shape (Dynamic Key -> Strict Value)
export type SortOptions = Record<string, SortOrder>;

const getSortOptions = (sortParam: string = 'createdAt_desc'): SortOptions => {
    const sortOptions: SortOptions = {};
    const parts = sortParam.split('_');
    const sortField = parts[0];
    const sortOrder: SortOrder = parts[1] === 'desc' ? -1 : 1;
    sortOptions[sortField] = sortOrder;
    logger.debug(`getSortOptions.ts -> sortOptions called for field: ${sortField}`);
    return sortOptions;
};

export default getSortOptions;