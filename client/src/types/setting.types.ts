export interface ISystemSettings {
    _id: string;
    logLevel: string;
    enableDbLogging: boolean;
    // Shows the demo-account button on the login page
    demoMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PublicSettings {
    demoMode: boolean;
}
