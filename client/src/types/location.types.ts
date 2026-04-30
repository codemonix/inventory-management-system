
export interface ILocation {
    _id: string;
    name: string;
    description?: string;
    color?: string;
}

// DTO for standard response with one location
export interface LocationResponse {
    location: ILocation;
}

// DTO for delete response
export interface DeleteResponse {
    success: boolean;
    message: string;
}