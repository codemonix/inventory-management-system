import { logInfo } from "../utils/logger.js";
import ItemCardTransfer from "./ItemCardTransfer.jsx";

export default function TransferItemsList({ items }) {
    logInfo("TransferItemsList -> items:", items);

    // Empty State
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mt-2">
                <p className="text-gray-500 font-medium">No items in this transfer.</p>
                <p className="text-xs text-gray-400 mt-1">This package is currently empty.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 py-2">
            {items.map((itm) => (
                <ItemCardTransfer 
                    key={itm.item?._id || Math.random()} 
                    item={itm} 
                />
            ))}
        </div>
    );
}