
export interface IStockEntry {
    locationId: string;
    locationName: string;
    quantity: number;
}

export interface IInventoryRecord {
    itemId: string;
    code: string;
    name: string;
    image: string;
    stock: IStockEntry[];   // one entry per location holding this item
    totalStock: number;
}

export interface FetchInventoryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
}

export interface StockTransactionResponse {
    success: boolean;
    updatedItem: {
        itemId: string;
        locationId: string;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }
}

export interface InventoryPaginatedResult {
    items: IInventoryRecord[];
    pagination: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}