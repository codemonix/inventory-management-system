
export default function LocationList({ locations, onDelete }) {
    console.log("LocationList -> last location", locations[locations.length - 1]);
    return (
        <ul className="space-y-2" >
            {locations.map((location) => (
                <li key={location._id} className="border p-2 flex justify-between items-center " >
                    <span>{ location.name }</span>
                    <button onClick={ () => onDelete(location._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200">
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}