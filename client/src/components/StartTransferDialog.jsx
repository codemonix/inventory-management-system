
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { logDebug } from '../utils/logger';


const StartTransferDialog = ({ open, onClose, onStartNewTransfer }) => {
    const [ fromLocation, setFromLocation ] = useState("");
    const [ toLocation, setToLocation ] = useState("");
    // const state = useSelector((state) => state);
    // logDebug("StartTransferDialog state: ", state);
    const locations = useSelector((state) => state.locations.locations);
    

    logDebug("StartTransferDialog locations: ", locations);

    const handleStartTransfer = () => {
        if (fromLocation && toLocation && fromLocation !== toLocation) {
            onStartNewTransfer(fromLocation, toLocation);
            onClose();
        } else {
            alert("Please select different locations for the transfer.");
        }
    };
    if (!open) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-6 rounded shadow-lg w-full max-w-md' >
                <h3 className='text-lg font-bold mb-4'>Start New Transfer</h3>
                <div className='mb-4'>
                    <label className='block mb-1' htmlFor='fromLocation'>From Location</label>
                    <select 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className='w-full border border-gray-300 rounded p-2'>
                        <option value=''>Select Location</option>
                        {locations.map((location) => (
                            <option key={location._id} value={location._id}>{location.name}</option>
                        ))}
                    </select>
                </div>
                <div className='mb-4' >
                    <label className='block mb-1' htmlFor='toLocation'>To Location</label>
                     <select 
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        className='w-full border border-gray-300 rounded p-2'>
                        <option value=''>Select Location</option>
                        {locations.map((location) => (
                            <option key={location._id} value={location._id}>{location.name}</option>
                        ))}
                    </select>
                    
                </div>
                <div className='flex justify-end space-x-2'>
                    <button
                        onClick={onClose}
                        className='bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartTransfer}
                        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                    >
                        Start Transfer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartTransferDialog;