import { ChipProps } from '@mui/material';
import { TransferHistoryFilters, TransferStatus } from '../types/transfer.types';

// Shared by the history grid and the mobile cards
export const transferStatusColor = (status: TransferStatus | undefined): ChipProps['color'] => {
    switch (status) {
        case 'in_transit': return 'info';
        case 'confirmed': return 'success';
        case 'cancelled': return 'error';
        default: return 'default';
    }
};

const STATUS_LABELS: Record<TransferStatus, string> = {
    in_transit: 'In transit',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
};

export const transferStatusLabel = (status: TransferStatus | undefined): string =>
    (status && STATUS_LABELS[status]) || 'Unknown';

export const EMPTY_TRANSFER_FILTERS: TransferHistoryFilters = {
    search: '', status: 'all', fromLocation: '', toLocation: '', dateFrom: '', dateTo: '',
};
