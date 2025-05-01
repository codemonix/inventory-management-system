
export default function ItemList({ items, onDelete}) {
    console.log("ItemList -> last item", items[items.length - 1]);
    return (
        <ul className="space-y-2 p-2" >
            {items.map((item) => (
                <li key={item._id} className="grid sm:grid-cols-[1fr_150px_100px_80px_auto] border border-gray-400 p-2 items-center gap-4 rounded-md bg-gray-300 " >
                    <span>{ item.name }</span>
                    <span className="text-sm font-light text-gray-700 hidden sm:block">Code: { item.code }</span>
                    <span className="text-sm font-light text-gray-700">Total: 50 </span>
                    <button onClick={ () => onDelete(item)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200">
                        Delete
                    </button>
                    <button onClick={ () => onDelete(item)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-200">
                        Edit
                    </button>
                </li>
            ))}
        </ul>
    );
}