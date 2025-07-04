import { render, screen, fireEvent } from "@testing-library/react";
import ItemCard from '../components/ItemCard.jsx';
import { describe, expect, it, vi } from "vitest";

const mockItem = {
    _id: 'item123',
    name: 'Test Item',
    imageUrl: '/test.png',
    totalQuantity: 12,
    stockByLocation: {
        locA: 5,
        locB: 7,
    },
};

// External function simulation
const totalStockMock = vi.fn().mockReturnValue(12);

describe('ItemCard', () => {
    it('Renders item name and quantity', () => {
        render(<ItemCard item={mockItem} totalStock={totalStockMock} />);
        expect(screen.getByText('Test Item')).toBeInTheDocument();
        expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('calls handles in In and Out button clicks', () => {
        const onIn = vi.fn();
        const onOut = vi.fn();

        render(<ItemCard item={mockItem} onIn={onIn} onOut={onOut} totalStock={totalStockMock} />);

        fireEvent.click(screen.getByLabelText('stock-in'));
        fireEvent.click(screen.getByLabelText('stock-out'));

        expect(onIn).toHaveBeenCalled();
        expect(onOut).toHaveBeenCalled();
    });
});