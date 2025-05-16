import { createSelector } from "@reduxjs/toolkit";
import { logDebug } from "../../utils/logger";
// import  selectAllItems  from "./itemsSelector.js";
// import { selectAllLocations } from "./locationsSelector.js";


export const selectTempTransfer = (state) => state.transfer.tempTransfer;
const selectAllLocations = (state) => state.locations.locations;
const selectAllItems = (state) => state.items.items;


export const selectTempTransferDetailed = createSelector(
    [selectTempTransfer, selectAllLocations, selectAllItems],
    (tempTransfer, allLocations, allItems) => {
        if (!tempTransfer) {
            return null;
        }
        logDebug("tempTransfer: ", tempTransfer);
        logDebug("allLocations: ", allLocations);
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


// export const selectTempTransferItemsWithDetails = createSelector(
//     [selectTempTransfer, selectAllItems],
//     (tempTransferItems, allItems) => {
//         return tempTransferItems.map(({ itemId, quantity}) => {
//             const item = allItems.find((i) => i._id === itemId);
//             return {
//                 itemId,
//                 quantity,
//                 name: item ? item.name : "Unknown Item",
//                 image: item ? item.imageUrl : null,
//             };
//         });
//     }
// )