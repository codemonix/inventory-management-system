import { render, screen, fireEvent, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import StartTransferDialog from "../components/StartTransferDialog";
import locationReducer from "../redux/slices/locationsSlice";
import { getLocations } from "../services/locationService";

vi.mock('../services/locationService', () => ({
    getLocations: vi.fn(() => Promise.resolve([
        { _id: 'loc1', name: 'Istanbul' },
        { _id: 'loc2', name: 'Dubai' },
    ])),
}));

// Regression: the list used to stay empty when the user reached Transfers from the Dashboard,
// because locations were only fetched on some navigation paths.
describe('StartTransferDialog locations', () => {
    it('loads the locations itself when nothing has loaded them yet', async () => {
        const store = configureStore({ reducer: { locations: locationReducer } });
        render(
            <Provider store={store}>
                <StartTransferDialog open onClose={vi.fn()} onStartNewTransfer={vi.fn()} />
            </Provider>
        );

        fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
        const listbox = await screen.findByRole('listbox');

        expect(await within(listbox).findByText('Istanbul')).toBeInTheDocument();
        expect(within(listbox).getByText('Dubai')).toBeInTheDocument();
        expect(getLocations).toHaveBeenCalledTimes(1);
    });
});
