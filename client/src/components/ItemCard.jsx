



const ItemCard = ({ item, locationColors }) => {
    return (
        <div div className="flex bg-white shadow-md rounded-lg p-4 mb-4" >
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
            <div className="flex flex-col">
                <span className="font-bold">{item.name}</span>
                <div className="flex mt-2">
                    {item.locations.map((loc, qty) => (
                        <div key={loc} className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: locationColors[loc] || "gray" }}></div>
                            <span className="text-sm">{qty}</span>
                            </div>
                        
                    ))}
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-green-500 text-white rounded">In</button>
                    <button className="px-3 py-1 text-sm bg-red-500 text-white rounded">Out</button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;