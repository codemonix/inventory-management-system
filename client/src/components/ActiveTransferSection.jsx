
import { logDebug } from "../utils/logger.js";
import TempTransferCard from "./TempTransferCard.jsx";

const ActiveTransferSection = ({ 
    tempTransfer, 
    tempTransferStatus, 
    populatedTempTransfer, 
    onStartNew, 
    onFinalize 
}) => {
    logDebug("ActiveTransferSection -> poulatedTempTransfer:", populatedTempTransfer);
    
    return (
        <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">In-Progress Transfer</h2>
                {!tempTransfer && tempTransferStatus !== 'loading' && (
                    <button 
                        onClick={onStartNew}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                        + Start New
                    </button>
                )}
            </div>

            {tempTransferStatus === 'loading' ? (
                <div className="flex justify-center p-10">
                    <div className="animate-pulse text-gray-400">Loading draft...</div>
                </div>
            ) : !tempTransfer ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                    <p className="text-gray-500 mb-4">No active transfer session found.</p>
                </div>
            ) : (
                <TempTransferCard 
                    populatedTempTransfer={populatedTempTransfer} 
                    onFinalize={onFinalize}
                    isUpdating={tempTransferStatus}
                />
            )}
        </section>
    );
};

export default ActiveTransferSection;