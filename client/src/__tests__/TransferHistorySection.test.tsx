import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TransferHistorySection from "../components/TransferHistorySection";
import locationReducer from "../redux/slices/locationsSlice";
import { ITransfer, TransferHistoryPage } from "../types/transfer.types";
import { getTransferHistory, confirmTransfer, cancelTransfer } from "../services/transferService";

vi.mock('../services/transferService', () => ({
    getTransferHistory: vi.fn(),
    confirmTransfer: vi.fn(),
    cancelTransfer: vi.fn(),
}));

const mockedGetHistory = vi.mocked(getTransferHistory);
const mockedConfirm = vi.mocked(confirmTransfer);
const mockedCancel = vi.mocked(cancelTransfer);

// Lets a test decide when the scroll sentinel "becomes visible"
let triggerIntersection: () => void = () => {};
class MockIntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {
        triggerIntersection = () => this.callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
        );
    }
    observe() {}
    disconnect() {}
    unobserve() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const makeTransfer = (n: number, status: ITransfer['status'] = 'in_transit'): ITransfer => ({
    _id: `transfer-${String(n).padStart(4, '0')}`,
    fromLocation: { _id: 'locA', name: `Source ${n}` },
    toLocation: { _id: 'locB', name: 'Destination' },
    items: [{ item: { _id: 'item1', name: 'Bolt', code: 'B-1' }, quantity: 2 }],
    status,
    createdAt: new Date(2026, 0, n).toISOString(),
    updatedAt: new Date(2026, 0, n).toISOString(),
});

const page = (transfers: ITransfer[], pageNo: number, total: number): TransferHistoryPage => ({
    transfers, total, page: pageNo, limit: 20, hasMore: pageNo * 20 < total,
});

const renderSection = (canConfirm = true, canCancel = false) => {
    const store = configureStore({ reducer: { locations: locationReducer } });
    const onError = vi.fn();
    render(
        <Provider store={store}>
            <TransferHistorySection onViewItems={vi.fn()} canConfirm={canConfirm} canCancel={canCancel} refreshKey={0} onError={onError} />
        </Provider>
    );
    return { onError };
};

describe('TransferHistorySection', () => {
    beforeEach(() => {
        mockedGetHistory.mockReset();
        mockedConfirm.mockReset();
    });

    it('loads the first page, then the next page when the end of the list scrolls into view', async () => {
        const first = Array.from({ length: 20 }, (_, i) => makeTransfer(i + 1));
        const second = Array.from({ length: 5 }, (_, i) => makeTransfer(i + 21));
        mockedGetHistory
            .mockResolvedValueOnce(page(first, 1, 25))
            .mockResolvedValueOnce(page(second, 2, 25));

        renderSection();

        expect(await screen.findByText('Source 1')).toBeInTheDocument();
        expect(screen.getByText('20 of 25')).toBeInTheDocument();

        act(() => triggerIntersection());

        expect(await screen.findByText('Source 25')).toBeInTheDocument();
        expect(screen.getByText('25 of 25')).toBeInTheDocument();
        expect(mockedGetHistory).toHaveBeenLastCalledWith(expect.any(Object), 2, 20, expect.any(AbortSignal));
        expect(screen.getByText('All transfers loaded')).toBeInTheDocument();
    });

    it('sends the search text to the server after typing pauses', async () => {
        mockedGetHistory.mockResolvedValue(page([makeTransfer(1)], 1, 1));
        renderSection();
        await screen.findByText('Source 1');

        fireEvent.change(screen.getByPlaceholderText(/search by item/i), { target: { value: 'bolt' } });

        await waitFor(() => {
            expect(mockedGetHistory).toHaveBeenLastCalledWith(
                expect.objectContaining({ search: 'bolt' }), 1, 20, expect.any(AbortSignal),
            );
        }, { timeout: 2000 });
    });

    it('hides the confirm action from users who may not confirm', async () => {
        mockedGetHistory.mockResolvedValue(page([makeTransfer(1)], 1, 1));
        renderSection(false);
        await screen.findByText('Source 1');

        expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
    });

    it('confirms a transfer and updates its row in place', async () => {
        mockedGetHistory.mockResolvedValue(page([makeTransfer(1)], 1, 1));
        mockedConfirm.mockResolvedValue({ transfer: { ...makeTransfer(1, 'confirmed'), confirmedAt: new Date().toISOString() } });
        renderSection(true);
        await screen.findByText('Source 1');

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Confirm Arrival' }));

        await waitFor(() => expect(mockedConfirm).toHaveBeenCalledWith('transfer-0001'));
        expect(await screen.findByRole('button', { name: 'Confirmed' })).toBeDisabled();
        // No full reload: only the first page was ever fetched
        expect(mockedGetHistory).toHaveBeenCalledTimes(1);
    });

    it('shows the cancel action only to admins', async () => {
        mockedGetHistory.mockResolvedValue(page([makeTransfer(1)], 1, 1));
        renderSection(true, false);
        await screen.findByText('Source 1');
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('lets an admin cancel an in-transit transfer and updates the row', async () => {
        mockedGetHistory.mockResolvedValue(page([makeTransfer(1)], 1, 1));
        mockedCancel.mockResolvedValue({ transfer: { ...makeTransfer(1, 'cancelled'), cancelledAt: new Date().toISOString() } });
        renderSection(true, true);
        await screen.findByText('Source 1');

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Cancel Transfer' }));

        await waitFor(() => expect(mockedCancel).toHaveBeenCalledWith('transfer-0001'));
        // Closed transfers can no longer be confirmed or cancelled
        expect(await screen.findByRole('button', { name: 'Cancelled' })).toBeDisabled();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });
});
