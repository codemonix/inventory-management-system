import ItemCard from "./ItemCard.jsx";

const ItemList = ({ items, onDelete, onEdit, onImageUpload }) => {
    // console.log("ItemList -> items", items);
    return (
        <div className=" p-2">
            { items.map((item) => (
                <ItemCard key={item._id} item={item} onDelete={onDelete} onEdit={onEdit} onImageUpload={onImageUpload} sx={{ mb: 2, p: 2 }} />
            ))}
            {(items.length === 0) && (
                <div className="text-center text-gray-500 mt-4">
                    No items found.
                </div>
            )}
        </div>
    );

};

export default ItemList;