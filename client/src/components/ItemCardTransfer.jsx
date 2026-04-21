import { logDebug } from "../utils/logger";
import { fetchItemImage } from "../services/itemService.js";
import { useManagedImage } from "../hooks/useManagedObjectImage.js";

export default function ItemCardTransfer({ item: transferItem }) {
    const { item, quantity } = transferItem;

    logDebug("ItemCardTransfer.jsx -> imageUrl:", item?.imageUrl);
    const imageObjUrl = useManagedImage(item?.imageUrl, fetchItemImage);

    return (
        <div className="relative group w-full aspect-square bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            
            {/* IMAGE */}
            {item?.imageUrl && imageObjUrl ? (
                <img 
                    src={imageObjUrl.displayUrl}
                    alt={item?.name || "Item image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
            ) : (
                // Safe Fallback matches the square aspect ratio
                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300 border-2 border-gray-100 border-dashed rounded-xl">
                    <span className="text-4xl">📦</span>
                    <span className="text-xs font-medium mt-2">No Image</span>
                </div>
            )}

            {/* FLOATING TEXT OVERLAYS (Labeled Markers) */}
            
            {/* Top-Right Marker: Quantity Pill */}
            <div className="absolute top-3 right-3 z-10">
                <span className="text-[11px] font-mono font-extrabold bg-blue-600/60 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20 tracking-tight">
                    QTY: {quantity}
                </span>
            </div>

            {/* Bottom-Left Marker: Item Name */}
            <div className="absolute bottom-3 left-3 right-8 z-10"> 
                <div className="inline-block bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10 max-w-full">
                    <p 
                        className="text-xs font-bold text-white truncate leading-tight tracking-tight" 
                        title={item?.name}
                    >
                        {item?.name || 'Unknown Item'}
                    </p>
                </div>
            </div>

            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
}