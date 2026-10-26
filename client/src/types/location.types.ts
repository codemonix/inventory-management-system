
export interface ILocation {
    _id: string;
    name: string;
    color?: string;
    type?: string;
}

// Fields a client may send when creating or editing a location
export type LocationInput = Pick<ILocation, 'name'> & Partial<Pick<ILocation, 'color' | 'type'>>;

// DTO for standard response with one location
export interface LocationResponse {
    location: ILocation;
}

// DTO for delete response
export interface DeleteResponse {
    success: boolean;
    message: string;
}