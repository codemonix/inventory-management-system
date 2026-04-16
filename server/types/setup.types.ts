
// Admin Input for setup
export interface IFirstAdminInput {
    name: string;
    email: string;
    password: string;
}

export interface ICreateAdminBody extends IFirstAdminInput {}

export interface ISetupStatusResponse {
    success: boolean;
    needSetup: boolean;
}