// Adjust this to match your actual Mongoose Item model
export interface IItem {
    _id: string;
    name: string;
    code: string;
    imageUrl?: string;
    category?: string;
    quantity: number;
    price?: number;
    createdAt: string;
    updatedAt: string;
}

// The exact Response DTO from your backend
export interface DashboardResponse {
    items: IItem[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
    };
}