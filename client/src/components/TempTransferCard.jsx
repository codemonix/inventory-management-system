import { logInfo } from "../utils/logger";


const TempTransferCard = ({ populatedTempTransfer, onFinalize }) => {
    logInfo('tempTransfer', populatedTempTransfer)
    if (!populatedTempTransfer || populatedTempTransfer.items.length === 0) {
        return <p className="text-gray-500 italic">No item in temporary transfer.</p>; // Don't render anything if there are no items
    }

    return (
        <div className="p-4 border border-yellow-400 rounded shadow-md bg-yellow-50">
            <div className="mb-3" >
                <p ><strong>From:</strong>{populatedTempTransfer.fromLocation?.name || 'N/A'} </p>
                <p><strong>To:</strong>{populatedTempTransfer.toLocation?.name || 'N/A'}</p>
            </div>
            <ul className="mb-3">
                {populatedTempTransfer.items.map((item) => (
                    <li key={item.itemId} className="border-b py-1 flex justify-between text-sm">
                        <span>{item.name? item.name : "Item Name"}</span>
                        <span className="text-gray-700" >Qty: {item.quantity}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onFinalize}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200">
                Finalize Transfer
            </button>

        </div>
    );
};


export default TempTransferCard;