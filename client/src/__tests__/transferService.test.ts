import { describe, it, expect, vi, beforeEach } from 'vitest';

// Guards the request contract with the server: POST /transfers/temp/add reads `itemId`
// (server/services/transfer.service.ts addItemToTempTransfer). A wrong field name breaks transfers.
const post = vi.fn();
vi.mock('../api/api', () => ({
  default: { post: (...args: unknown[]) => post(...args) },
  isApiError: () => false,
}));

import { addItemToTempTransfer } from '../services/transferService';
import { configureStore } from '@reduxjs/toolkit';
import { addItem } from '../redux/thunks/transferThunks';

describe('transfer add-item request', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: { success: true, temp: { items: [] } } });
  });

  it('sends itemId, quantity and sourceLocationId to the server', async () => {
    await addItemToTempTransfer({ itemId: 'item-1', quantity: 3, sourceLocationId: 'loc-1' });

    expect(post).toHaveBeenCalledWith('/transfers/temp/add', {
      itemId: 'item-1',
      quantity: 3,
      sourceLocationId: 'loc-1',
    });
  });

  it('passes itemId through the addItem thunk unchanged', async () => {
    const store = configureStore({ reducer: (state = {}) => state });
    await store.dispatch(addItem({ itemId: 'item-2', quantity: 1, sourceLocationId: 'loc-2' }));

    const [, body] = post.mock.calls[0];
    expect(body).toHaveProperty('itemId', 'item-2');
    expect(body).not.toHaveProperty('item');
  });
});
