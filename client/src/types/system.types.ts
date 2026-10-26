

export interface SystemActionResponse {
    success: boolean;
    message: string;
}

// Matches the server's POST /system/clear targets
export type ClearTarget = 'transfers' | 'items';

