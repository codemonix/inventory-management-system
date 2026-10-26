

export interface IItem {
    _id: string;
    name: string;
    price?: number;
    imageUrl?: string;
    code: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Fields a client may send when creating or editing an item
export interface ItemInput {
    name: string;
    category?: string;
    price?: number | string;
}

export interface PaginatedItemsResult {
    items: IItem[];
    totalCount: number;
}

export interface GetItemsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
}

export interface DeleteResponse {
    message: string;
}