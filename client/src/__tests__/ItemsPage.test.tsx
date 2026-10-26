import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeAll } from "vitest";
import ItemsPage from '../pages/ItemsPage';
import itemsReducer from '../redux/slices/itemsSlice';
import locationReducer from "../redux/slices/locationsSlice";
import transferReducer from "../redux/slices/transferSlice";
import { UserRole } from "../types/auth.types";

const mockItems = [
    { _id: '1', name: 'Mocked Item One', code: 'A-1', imageUrl: 'mock1.jpg' },
    { _id: '2', name: 'Mocked Item Two', code: 'A-2', imageUrl: 'mock2.jpg' },
];

vi.mock('../services/itemService', () => ({
    getPaginatedItems: vi.fn(() => Promise.resolve({ items: mockItems, totalCount: 2 })),
    fetchItemImage: vi.fn(() => Promise.resolve('blob:mock-image')),
    createItem: vi.fn(),
    deleteItem: vi.fn(),
    updateItem: vi.fn(),
}));

vi.mock('../services/locationService', () => ({
    getLocations: vi.fn(() => Promise.resolve([
        { _id: 'loc1', name: 'Warehouse A' },
        { _id: 'loc2', name: 'Warehouse B' },
    ])),
}));

vi.mock('../services/inventoryService', () => ({
    fetchStockTotals: vi.fn(() => Promise.resolve({ '1': 12, '2': 0 })),
    stockIn: vi.fn(),
    stockOut: vi.fn(),
}));

// Role used by the mocked auth context; each test sets it before rendering
let mockRole: UserRole = 'admin';
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        isLoggedIn: true,
        loading: false,
        user: { role: mockRole },
        isAdmin: mockRole === 'admin',
        isManager: mockRole === 'manager',
    }),
}));

beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
});

const buildStore = () => configureStore({
    reducer: {
        items: itemsReducer,
        locations: locationReducer,
        transfer: transferReducer,
    },
});

const renderItemsPage = (role: UserRole) => {
    mockRole = role;
    render(
        <Provider store={buildStore()}>
            <MemoryRouter>
                <ItemsPage />
            </MemoryRouter>
        </Provider>
    );
};

describe('ItemsPage', () => {
    it('renders items loaded from the server', async () => {
        renderItemsPage('admin');
        expect(await screen.findByText('Mocked Item One')).toBeInTheDocument();
        expect(await screen.findByText('Mocked Item Two')).toBeInTheDocument();
    });

    it('shows edit, delete and add actions to an admin', async () => {
        renderItemsPage('admin');
        await screen.findByText('Mocked Item One');
        expect(screen.getAllByTitle('Edit Item').length).toBeGreaterThan(0);
        expect(screen.getAllByTitle('Delete Item').length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('lets a manager edit but not delete', async () => {
        renderItemsPage('manager');
        await screen.findByText('Mocked Item One');
        expect(screen.getAllByTitle('Edit Item').length).toBeGreaterThan(0);
        expect(screen.queryByTitle('Delete Item')).not.toBeInTheDocument();
    });

    it('hides catalog actions from a regular user but keeps stock in/out', async () => {
        renderItemsPage('user');
        await screen.findByText('Mocked Item One');
        expect(screen.queryByTitle('Edit Item')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Delete Item')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /add item/i })).not.toBeInTheDocument();
        expect(screen.getAllByTitle('Stock In').length).toBeGreaterThan(0);
    });
});
