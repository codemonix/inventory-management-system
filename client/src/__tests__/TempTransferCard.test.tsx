import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TempTransferCard from "../components/TempTransferCard";
import { PopulatedDraftTransfer } from "../hooks/useTransferManager";

const draft: PopulatedDraftTransfer = {
    fromLocation: { _id: 'a', name: 'Warehouse A' },
    toLocation: { _id: 'b', name: 'Warehouse B' },
    items: [
        { itemId: 'i1', quantity: 3, name: 'Bolt', image: null },
        { itemId: 'i2', quantity: 1, name: 'Nut', image: null },
    ],
};

const renderCard = (value: PopulatedDraftTransfer) => {
    const handlers = { onFinalize: vi.fn(), onRemoveItem: vi.fn(), onDiscard: vi.fn() };
    render(<TempTransferCard populatedTempTransfer={value} {...handlers} />);
    return handlers;
};

describe('TempTransferCard', () => {
    it('removes a single line from the draft', () => {
        const { onRemoveItem } = renderCard(draft);
        fireEvent.click(screen.getByRole('button', { name: 'Remove Bolt from transfer' }));
        expect(onRemoveItem).toHaveBeenCalledWith('i1');
    });

    it('asks for confirmation before discarding a draft with items', async () => {
        const { onDiscard } = renderCard(draft);
        fireEvent.click(screen.getByRole('button', { name: /discard draft/i }));
        expect(onDiscard).not.toHaveBeenCalled();

        fireEvent.click(await screen.findByRole('button', { name: 'Discard' }));
        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('discards an empty draft right away', () => {
        const { onDiscard } = renderCard({ ...draft, items: [] });
        fireEvent.click(screen.getByRole('button', { name: /discard draft/i }));
        expect(onDiscard).toHaveBeenCalledTimes(1);
    });
});
