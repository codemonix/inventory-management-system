import { createSelector } from "@reduxjs/toolkit";
import { logInfo, logDebug } from "../../utils/logger";
import { RootState } from "../store";
import { ILocation } from "../../types/location.types";
import { getAllItems } from "../../services/itemService";


// export interface PopulatedTransferItem {
//     itemId: string;
//     quantity: number;
//     name: string;
//     image: string | null;
// }

export interface PopulatedTempTransfer {
    fromLocation: ILocation | undefined;
    toLocation: ILocation | undefined;
    items: { itemId: string; quantity: number; } [];
}

export const selectTempTransfer = (state: RootState) => state.transfer.data;
const selectAllLocations = (state: RootState) => state.locations.locations;
// const selectAllItems = (state: RootState) => state.items.fullList;
const allItems = await getAllItems();



export const selectTempTransferLocations = createSelector(
    [selectTempTransfer, selectAllLocations],
    (tempTransfer, allLocations): PopulatedTempTransfer | null => {
        logDebug("transferSelector -> allItems ->", {allItems});
        if (!tempTransfer) {
            logInfo("transferSelector.js -> No tempTransfer");
            return null;
        }
        logDebug("transferSelector.js -> Selector tempTransfer: ", tempTransfer);
        logDebug("transferSelector.js -> selectAlllLocations: ", allLocations);
        const fromLocationDetails = allLocations.find((location) => location._id === tempTransfer.fromLocation);
        const toLocationDetails = allLocations.find((location) => location._id === tempTransfer.toLocation);

        // const itemsWithDetails: PopulatedTransferItem[] = tempTransfer.items.map(({ itemId, quantity }) => {
        //     const item = allItems.find((i) => i.id === itemId);
        //     logDebug("transferSelector.js -> allItems: ", allItems);
        //     logDebug("transferSelector.js -> item: ", item);
        //     return {
        //         itemId,
        //         quantity,
        //         name: item ? item.name : "Unknown Item",
        //         image: item?.imageUrl || null,
        //     };
        // });

        return {
            fromLocation: fromLocationDetails,
            toLocation: toLocationDetails,
            items: tempTransfer.items,
        };
    }
);
