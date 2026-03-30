
import FinalizedTransferCard from "./FinalizedTransferCard.jsx";

const TransferHistorySection = ({ transfers, onViewItems, onConfirmDialog }) => {
    return (
        <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Finalized History</h2>
            
            {transfers.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-gray-400 italic">No past transfers found.</p>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {transfers.map((transfer) => (
                        <FinalizedTransferCard 
                            key={transfer._id} 
                            transfer={transfer} 
                            onViewItems={() => onViewItems(transfer)}
                            onConfirm={() => onConfirmDialog(transfer)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default TransferHistorySection;