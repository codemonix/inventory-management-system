import { createSelector } from "@reduxjs/toolkit";
import { logInfo, logDebug } from "../../utils/logger";
import { RootState } from "../store";
import { ILocation } from "../../types/location.types";


export interface PopulatedTempTransfer {
    fromLocation: ILocation | undefined;
    toLocation: ILocation | undefined;
    items: { itemId: string; quantity: number; } [];
}

export const selectTempTransfer = (state: RootState) => state.transfer.data;
const selectAllLocations = (state: RootState) => state.locations.locations;




export const selectTempTransferLocations = createSelector(
    [selectTempTransfer, selectAllLocations],
    (tempTransfer, allLocations): PopulatedTempTransfer | null => {
        if (!tempTransfer) {
            logInfo("transferSelector -> No tempTransfer");
            return null;
        }
        logDebug("transferSelector -> Selector tempTransfer: ", tempTransfer);
        logDebug("transferSelector -> selectAlllLocations: ", allLocations);
        const fromLocationDetails = allLocations.find((location) => location._id === tempTransfer.fromLocation);
        const toLocationDetails = allLocations.find((location) => location._id === tempTransfer.toLocation);

        return {
            fromLocation: fromLocationDetails,
            toLocation: toLocationDetails,
            items: tempTransfer.items,
        };
    }
);
