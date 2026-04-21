
export interface ILocation {
    id: string;
    name: string;
    description?: string;
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