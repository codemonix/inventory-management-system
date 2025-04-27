



const ItemCard = ({ item, locationColors }) => {
    // console.log("ItemCard Props:", item, locationColors); // Log the props to check if they are being passed correctly
    return (
        <div div className="flex bg-gray-300 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" >
            <img src={item.image} alt={item.name} className="w-25 h-25 object-cover rounded mr-4" />
            <div className="flex flex-col flex-grow">
                <span className="font-bold">{item.name}</span>
                {item.stock.map((stock) => (
                    <div key={stock.locationId} className="flex items-center space-x-1">
                        <div className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: locationColors[stock.locationName] || "gray" }}></div>
                        <span className="text-sm">{stock.locationName}: {stock.quantity}</span>
                    </div>
                ))}
            </div>
            <div className="flex flex-col items-center gap-2 mt-2 ml-auto">
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded flex-1 w-full">In</button>
                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded flex-1 w-full">Out</button>
            </div>
        </div>
    );
};

export default ItemCard;