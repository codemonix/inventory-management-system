import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { addItem } from '../redux/thunks/transferThunks';
import { stockIn, stockOut } from '../services/inventoryService';
import { logError, logWarning } from '../utils/logger';

export type StockActionType = 'IN' | 'OUT' | 'TRANSFER';

export const useStockAction = ({ onSuccess }: { onSuccess?: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();

  const tempTransfer = useSelector((state: RootState) => state.transfer.data);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<StockActionType>('IN');
  const [defaultLocation, setDefaultLocation] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

  // Stable between renders so memoized lists/grids that receive it do not rebuild
  const openDialog = useCallback((item: { itemId: string }, type: StockActionType) => {
    setCurrentItemId(item.itemId);
    setActionType(type);
    setDialogOpen(true);
    setLocalError('');

    if (type === 'TRANSFER') {
      setDefaultLocation(tempTransfer?.fromLocation ?? null);
    } else {
      setDefaultLocation(null);
    }
  }, [tempTransfer?.fromLocation]);

  const closeDialog = () => {
    setDialogOpen(false);
    setLocalError('');
    setCurrentItemId(null);
  };

  const submitAction = async (locationId: string, quantity: number) => {
    setLocalError('');
    if (!currentItemId) {
      setLocalError('Missing item id.');
      return false;
    }

    try {
      switch (actionType) {
        case 'IN':
          await stockIn(currentItemId, locationId, quantity);
          break;
        case 'OUT':
          await stockOut(currentItemId, locationId, quantity);
          break;
        case 'TRANSFER':
          if (tempTransfer?.fromLocation && tempTransfer.fromLocation !== locationId) {
            logWarning('Location mismatch!');
            setLocalError('Location mismatch! Please select the correct source location.');
            return false;
          }
          await dispatch(addItem({ itemId: currentItemId, quantity, sourceLocationId: locationId })).unwrap();
          break;
      }

      onSuccess?.();
      closeDialog();
      return true;
    } catch (err: unknown) {
      logError('Error in useStockAction -> submitAction:', err);
      // Thunks rejected via .unwrap() throw their rejectWithValue string, services throw Error
      const errorMessage =
        typeof err === 'string' ? err : err instanceof Error ? err.message : 'An error occurred.';
      setLocalError(errorMessage);
      return false;
    }
  };

  return {
    dialogOpen,
    currentItemId,
    actionType,
    defaultLocation,
    localError,
    openDialog,
    closeDialog,
    submitAction,
  };
};

