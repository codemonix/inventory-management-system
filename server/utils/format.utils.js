
export const formatInventory = (inventory) => {
    return inventory.map(item => ({
        ...item.toObject(),
        totalQuantity: item.locations.reduce(( sum, loc) => sum + loc.quantity, 0),
    }));
};