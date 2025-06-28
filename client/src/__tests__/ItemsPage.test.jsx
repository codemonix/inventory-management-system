import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect } from "vitest";
import { it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock('../redux/slices/itemsSlice.js', async () => {
    const actual = await import('../redux/slices/itemsSlice.js');
    return {
        ...actual,
        loadItems: () => () => {}
        // fetchItems: vi.fn(() => {
        //     console.log("MOK fetch items");
        //     return () => {};
        // }),
    }
})



import itemsReducer from '../redux/slices/itemsSlice.js';
import locationReducer from "../redux/slices/locationsSlice.js"
import ItemsPage from '../pages/ItemsPage.jsx';
import { Provider } from "react-redux";





describe('ItemsPage', () => {
    it('renders item from store', () => {
        const store = configureStore({
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
                    loading: false,
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
            < Provider store={store} >
                <MemoryRouter >
                        <ItemsPage />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Item One')).toBeInTheDocument();
        expect(screen.getByText('Item Two')).toBeInTheDocument();
    });


});

