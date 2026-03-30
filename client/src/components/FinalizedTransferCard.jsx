import { logDebug, logInfo } from "../utils/logger";

const FinalizedTransferCard = ({ transfer, onViewItems, onConfirm }) => {
    logDebug("FinalizedTransferCard.jsx -> transfer:", transfer);
    logInfo("loading FinalizedTransferCard ...");

    const { fromLocation, toLocation, status, _id, items = [] } = transfer;
    const isConfirmed = status === 'confirmed';

    return (
        <div className="max-w-md mx-auto w-full b-4 p-2 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <div>
                    <div className="flex items-center space-x-2 text-sm md:text-base">
                        <span className="font-bold text-gray-700">{fromLocation?.name || 'N/A'}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-bold text-blue-600">{toLocation?.name || 'N/A'}</span>
                    </div>
                    <div className="mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                            {status}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 font-mono">ID: {_id.slice(-6)}</span>
                    </div>
                </div>

                <div className="flex space-x-2 mt-3 sm:mt-0 w-full sm:w-auto">
                    <button 
                        onClick={onViewItems} 
                        className="flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                        View Items
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isConfirmed}
                        className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${
                            isConfirmed 
                                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isConfirmed ? 'Confirmed' : 'Confirm'}
                    </button>
                </div>
            </div>

            {items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Manifest</p>
                    <ul className="space-y-1">
                        {items.slice(0, 3).map((item) => (
                            <li key={item.item?._id} className="flex justify-between text-sm bg-gray-300 rounded-md p-2">
                                <span className="text-gray-600">{item.item?.name}</span>
                                <span className="font-medium text-gray-900">x{item.quantity}</span>
                            </li>
                        ))}
                        {items.length > 3 && (
                            <li className="text-xs text-blue-500 italic">+{items.length - 3} more items...</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FinalizedTransferCard;