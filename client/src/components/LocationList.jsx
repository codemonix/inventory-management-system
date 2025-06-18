import { useAuth } from "../context/AuthContext";




export default function LocationList({ locations, onDelete }) {
    const { isAdmin, isManager } = useAuth();
    const isAdminOrManager = isAdmin || isManager; 
    // console.log("LocationList -> last location", locations[locations.length - 1]);
    return (
        <ul className="space-y-2" >
            {locations.map((location) => (
                <li key={location._id} className="border p-2 flex justify-between items-center " >
                    <span>{ location.name }</span>
                    <button onClick={ () => onDelete(location._id)}
                        className={`px-2 py-1 rounded transition duration-200
    ${!isAdminOrManager ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}