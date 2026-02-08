import { createSelector } from "@reduxjs/toolkit";
import { logInfo } from "../../utils/logger";

export const selectTempTransfer = (state) => state.transfer.tempTransfer;
const selectAllLocations = (state) => state.locations.locations;
const selectAllItems = (state) => state.items.fullList;


export const selectTempTransferDetailed = createSelector(
    [selectTempTransfer, selectAllLocations, selectAllItems],
    (tempTransfer, allLocations, allItems) => {
        console.log("transferSelector -> allItems ->", allItems);
        if (!tempTransfer) {
            console.log("transferSelector.js -> No tempTransfer");
            return null;
        }
        logInfo("transferSelector.js -> Selector tempTransfer: ", tempTransfer);
        logInfo("transferSelector.js -> selectAlllLocations: ", allLocations);
        const fromLocationDetails = allLocations.find((location) => location._id === tempTransfer.fromLocation);
        const toLocationDetails = allLocations.find((location) => location._id === tempTransfer.toLocation);

        const itemsWithDetails = tempTransfer.items.map(({ itemId, quantity }) => {
            const item = allItems.find((i) => i._id === itemId);
            return {
                itemId,
                quantity,
                name: item ? item.name : "Unknown Item",
                image: item ? item.imageUrl : null,
            };
        });

        return {
            fromLocation: fromLocationDetails,
            toLocation: toLocationDetails,
            items: itemsWithDetails,
        };
    }
);
