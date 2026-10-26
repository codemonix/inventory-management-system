import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StockActionDialog from '../components/StockActionDialog';

const locations = [{ _id: 'loc1', name: 'Warehouse A' }];

describe('StockActionDialog', () => {
    it('submits a stock movement only once while the request is running', async () => {
        let finishRequest: () => void = () => {};
        const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finishRequest = resolve; }));

        render(<StockActionDialog open onClose={vi.fn()} onSubmit={onSubmit} locations={locations} type="IN" />);

        fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } });
        const confirm = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirm);
        fireEvent.click(confirm);

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith('loc1', 5);
        expect(confirm).toBeDisabled();

        finishRequest();
        await waitFor(() => expect(confirm).toBeEnabled());
    });
});
