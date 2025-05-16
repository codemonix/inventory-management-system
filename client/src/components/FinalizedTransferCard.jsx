import { logInfo } from "../utils/logger";


const FinalizedTransferCard = ({ transfer }) => {
    logInfo(transfer.items[0])

    return (
        <div className="mb-2 p-2 border border-gray-300 rounded bg-white shadow-sm">
            <div className="mb-1">
                <p><strong>From:</strong>{transfer.fromLocation?.name || 'N/A'}</p>
                <p><strong>To:</strong>{transfer.toLocation?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">ID: {transfer.id}</p>
            </div>

            <ul>
                {
                    transfer.items.map((item) => (
                        <li key={item.item._id} className="border-b py-1 flex justify-between text-sm">
                            <span>{item.item.name}</span>
                            <span className="text-gray-700">Qty: {item.quantity}</span>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};

export default FinalizedTransferCard;