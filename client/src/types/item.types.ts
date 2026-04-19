

export interface IItem {
    id: string;
    name: string;
    price?: number;
    description?: string;
    imageUrl: string;
    code: string;

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