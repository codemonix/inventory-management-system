import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import ItemCard from '../components/ItemCard';
import { IItem } from "../types/item.types";

vi.mock('../services/itemService', () => ({
    fetchItemImage: vi.fn(() => Promise.resolve('blob:mock-image')),
}));

const mockItem: IItem = {
    _id: 'item123',
    name: 'Test Item',
    code: 'CODE-1',
    imageUrl: '/test.png',
};

const totalStockMock = 12;

beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
});

describe('ItemCard', () => {
    it('Renders item name and quantity', () => {
        render(<ItemCard item={mockItem} totalStock={totalStockMock} onIn={vi.fn()} onOut={vi.fn()} />);
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

    it('hides edit and delete when no handlers are passed', () => {
        render(<ItemCard item={mockItem} onIn={vi.fn()} onOut={vi.fn()} totalStock={0} />);
        expect(screen.queryByTitle('Edit Item')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Delete Item')).not.toBeInTheDocument();
    });
});
