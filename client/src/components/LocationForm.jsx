
import { useState } from 'react';
import { createLocation } from '../services/locationsService.js';

export default function LocationForm({ onLocationCreated }) {
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newLocation = { name };
        try {
            const createdLocation = await createLocation(newLocation);
            onLocationCreated(createdLocation); // Call the callback function with the created location
            setName(''); // Clear the input field after submission
        } catch (error) {
            console.error('LocationForm -> Error creating location:', error.message);
        };
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col items-center bg-gray-200 p-4 rounded-md shadow-md'>
            <h2 className='text-lg font-semibold mb-4'>Add New Location</h2>
            <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Location Name'
                className='border border-gray-300 p-2 rounded-md mb-4 w-full'
                required
            />
            <button type='submit' className='bg-blue-500 text-white p-2 rounded-md'>Create Location</button>
        </form>
    );

}