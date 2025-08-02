
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import ItemsPage from '../pages/ItemsPage.jsx';



vi.mock('../redux/slices/itemsSlice.js', async () => {
    const actual = await import('../redux/slices/itemsSlice.js');
    return {
        ...actual,
        loadItems: () => async (dispatch) => {
            dispatch({ type: 'items/loadItems/pending'});
            dispatch({
                type: 'items/loadItems/fulfilled',
                payload: {
                    items: [
                        { _id: '1' , name: 'Mocked Item One', totalQuantity: 10, imageUrl: 'mock1.jpg' },
                        { _id: '2', name: 'Mocked Item Two', totalQuantity: 4, imageUrl: 'mock2.jpg'},
                    ]
                },
                totalCount: 2
            });
        }
    };
});

vi.mock('../services/itemsService.js', () => ({
    fetchItems: vi.fn(() => Promise.resolve([
        { _id: '1' , name: 'Mocked Item One', totalQuantity: 10, imageUrl: 'mock1.jpg' },
        { _id: '2', name: 'Mocked Item Two', totalQuantity: 4, imageUrl: 'mock2.jpg'},
    ])),
    fetshItemImage: vi.fn(() => Promise.resolve('data:image/jpeg;base64,MOCK_IMAGE')),
    deleteItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/locationsService.js', () => ({
    fetchLocations: vi.fn(() => Promise.resolve([
        { _id: 'loc1', name: 'Warehouse A' },
        { _id: 'loc2', name: 'Warehouse B' },
  ])),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:http://mock-image-url'),
});

vi.mock('../services/authServices.js', () => ({
  fetchUserData: vi.fn(() => ({ role: 'admin' })),
}));

vi.mock('react-roter-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: () => {
            return [
                new URLSearchParams({ page: '1', limit: '10', sort: 'name_asc', search: '' }),
                vi.fn()
            ];
        }
    };
});


import { configureStore } from "@reduxjs/toolkit";
import { describe, expect } from "vitest";
import { it, vi } from "vitest";



// The order of import matters
import itemsReducer from '../redux/slices/itemsSlice.js';
import locationReducer from "../redux/slices/locationsSlice.js";

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
});



describe('ItemsPage', () => {
    it('renders item from store', () => {
        const mockStore = configureStore({
            reducer: {
                items: itemsReducer,
                locations: locationReducer,
            },
            preloadedState: {
                items: {
                    list: [
                        {
                            _id: '1',
                            name: 'Item One',
                            totalQuantity: 10,
                            imageUrl: '/uploads/items/default.jpg',
                        },
                        {
                            _id: '2',
                            name: 'Item Two',
                            totalQuantity: 4,
                            imageUrl: '/uploads/items/default.jpg',
                        },
                    ],
                    status: 'succeeded',
                    error: null
                },
                locations: {
                    locations: [
                        {
                            _id: '1',
                            name: 'istanbul',
                        },
                        {
                            _id: '2',
                            name: 'Mashhad',
                        },
                    ],
                }
            },
        });     


        render(
            < Provider store={mockStore} >
                <MemoryRouter >
                        <ItemsPage />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Mocked Item One')).toBeInTheDocument();
        expect(screen.getByText('Mocked Item Two')).toBeInTheDocument();
    });


});

