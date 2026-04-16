

export const formatInventory = (inventory: any[]) => {
    return inventory.map(item => ({
        ...item.toObject(),
        totalQuantity: item.locations.reduce(( sum: number, loc: any) => sum + loc.quantity, 0),
    }));
};