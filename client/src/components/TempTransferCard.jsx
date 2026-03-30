import { logDebug, logInfo } from "../utils/logger";

const TempTransferCard = ({ populatedTempTransfer, onFinalize }) => {
    logDebug("TempTransferCard.jsx -> populatedTempTransfer:", populatedTempTransfer);
    logInfo("loading TempTransferCard ...");



    const { fromLocation, toLocation, items =[] } = populatedTempTransfer;

    // Early return for empty states
    if (!populatedTempTransfer || !populatedTempTransfer.items || populatedTempTransfer.items.length === 0) {
        return (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="flex justify-center items-center space-x-2 pt-2">
                    <p className="text-sm font-semibold text-gray-700">{fromLocation?.name || 'N/A'}</p>
                    <span className="text-red-400">→</span>
                    <p className="text-sm font-semibold text-blue-700">{toLocation?.name || 'N/A'}</p>
                </div>
                <p className="text-gray-500 italic">No items in temporary transfer.</p>
            </div>
        );
    }

    const hasItem = items.length > 0;

    return (
        <div className="max-w-md mx-auto p-5 border-2 border-yellow-200 rounded-xl shadow-sm bg-yellow-50/50 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
                        Draft Transfer
                    </span>
                    <div className="flex items-center space-x-2 pt-2">
                        <p className="text-sm font-semibold text-gray-700">{fromLocation?.name || 'N/A'}</p>
                        <span className="text-red-400">→</span>
                        <p className="text-sm font-semibold text-blue-700">{toLocation?.name || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-yellow-100 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Items to Move</p>
                <ul className="divide-y divide-gray-50">
                    {items.map((item) => (
                        <li key={item.itemId || item._id} className="py-2 flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">
                                {item.name || "Unknown Item"}
                            </span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                                x{item.quantity}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={onFinalize}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transform active:scale-[0.98] transition-all duration-200 text-sm"
            >
                Finalize & Save Transfer
            </button>
        </div>
    );
};

export default TempTransferCard;