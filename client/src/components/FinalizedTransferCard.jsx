import { logInfo } from "../utils/logger";


const FinalizedTransferCard = ({ transfer, onViewItems, onConfirm }) => {
    logInfo(transfer.items[0])

    return (
        <div className="mb-2 p-2 border border-gray-300 rounded bg-white shadow-sm">
            <div className="flex flex-row">
                <div className="mb-1">
                    <div className="flex justify-between" >
                        <p><span  className=""><strong>From:</strong></span><span className="ml-1">{transfer.fromLocation?.name || 'N/A'}</span></p>
                        <p><strong className="ml-2">To:</strong><span className="ml-1">{transfer.toLocation?.name || 'N/A'}</span></p>

                    </div>
                    <p className="text-xs text-gray-500">Status:<strong className="ml-1">{transfer.status}</strong></p>
                    <p className="text-xs text-gray-500">ID: {transfer._id}</p>
                </div>
                <div className="flex items-center flex-col pl-2 ml-auto" >
                    <button onClick={onViewItems} className="px-4 py-1 cursor-pointer bg-blue-400 rounded text-white m-1 w-30 " >Items</button>
                    <button 
                        onClick={onConfirm}
                        disabled={transfer.status === 'confirmed'}
                        className={`px-4 py-1 rounded text-white m-1 w-30 ${
                            transfer.status === 'confirmed' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 cursor-pointer'
                        }`}
                        >
                        Confirm
                    </button>
                    {/* <button onClick={onConfirm} className="px-4 py-1 cursor-pointer bg-blue-400 rounded text-white m-1 w-30">Confirm</button> */}
                </div>
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