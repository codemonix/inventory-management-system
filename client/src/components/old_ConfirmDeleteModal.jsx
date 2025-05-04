import React from "react";

const ConfirmDeleteModal = ({ title, message, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-60" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 z-10">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ConfirmDeleteModal;