
import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import Item from "../models/item.model.js";
import Location from "../models/location.model.js";
import { logTransaction } from "../services/transactionService.js";
import log from '../utils/logger.js';



export async function createInventory(req, res) {
    try {
        const { itemId , locationId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ error: "Invalid itemId or locationId."});
        }

        const isExistItem = await Item.findById(itemId);
        const isExistLocation = await Location.findById(locationId);

        if (!isExistItem || !isExistLocation) {
            return res.status(404).json({ error: 'Item or Location not found.'});
        }

        const existing = await Inventory.findOne({ itemId, locationId });

        if ( existing ) {
            return res.status(409).json({ error: "Inventory already exists for this item and location."});
        }

        const newInventory = new Inventory({ itemId, locationId, quantity });
        await newInventory.save();

        res.status(201).json(newInventory);

    } catch (error) {
        log(error.message);
        res.status(500).json({ error: 'Failed to create inventory item.' });
    }
}


export const getInventory = async (req, res) => {
    log("req.query:", req.query);
    try {

        const page = Math.max(parseInt(req.query.page) || 1);
        const limit = Math.max(parseInt(req.query.limit) || 10);

        console.log("page:", page, "limit:", limit);
        console.log("search:", req.query.search);

        let sortStage = { "name" : 1 };
        if (req.query.sort) {
            const [ filed, dir ] = req.query.sort.split('_');
            sortStage = { [filed] : dir === "desc" ? -1 : 1 };
        } 

        const countResult = await Inventory.aggregate([
            {
                $group: { _id: "$itemId"}
            },
            {
                $count: "count"
            }
        ]);

        const totalCount = (countResult[0] && countResult[0].count) || 0;
        log("inventory.controller -> getInventory, totalCount:", totalCount);

     
        const totalPages = Math.ceil(totalCount / limit);
        log("inventory.controller -> getInventory, totalPages:", totalPages);

        const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;

        const skip = ( currentPage - 1 ) * limit

        //  Build the aggregation pipeline that returns exactly one doc per itemId:

        const pipeline = [ 
            {
                $lookup: {
                    from:   "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as:     "item"
                }
            },
            {
                $unwind: "$item"
            },];

            if (req.query.search) {
                const escapeRegex = (str) =>
                    str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                pipeline.push({
                    $match: {
                        "item.name": { $regex: escapeRegex(req.query.search), $options: 'i' }
                    }
                })
            }
        // pipeline.push(
        //     {
        //         $match: {
        //             "item.name": { $regex: req.query.search || '', $options: 'i' }
        //         }
        //     },);


        pipeline.push(
            {
                $lookup: {
                    from:       "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as:         "location"
                }
            },
            {
                $unwind: "$location"
            },
            {
                $lookup: {
                    from:       "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as:         "location"
                }
            },
            {
                $unwind: "$location"
            },
            {
                $group: {
                    _id:        "$itemId",
                    name:       { $first: "$item.name" },
                    image:      { $first: "$item.imageUrl" },
                    stock:      {
                        $push: {
                            locationId:     "$location._id",
                            locationName:   "$location.name",
                            quantity:       "$quantity"
                        }
                    },
                    totalStock: {$sum: "$quantity" }
                }
            },

            {
                $project: {
                    _id:        0,
                    itemId:     "$_id",
                    name:       1,
                    image:      1,
                    stock:      1,
                    totalStock: 1
                }
            },

            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit }
        );

        const pagedInventoryWithnStock = await Inventory.aggregate(pipeline);
        log("inventory.cont. -> getInventory, pagedInventory:", pagedInventoryWithnStock)


        return res.json({
            items: pagedInventoryWithnStock,
            pagination: {
                totalCount,
                totalPages,
                currentPage,
                pageSize: limit
            }
        })

        // const pagedInventory = itemsWithStock.slice(skip, skip  + limit);

        // return res.json({
        //     items: pagedInventory,
        //     pagination: {
        //         totalCount,
        //         totalPages,
        //         currentPage: page,
        //         pageSize: limit
        //     }
        // });
    } catch (error) {
        log(error.message)
        return res.status(500).json({message: "Error getting inventory"});
    };
};


   // const allItems = await Inventory.find()
        //     .populate("itemId", "name imageUrl")
        //     .populate("locationId", "name")
        //     .lean()
        // // console.log('allItems', allItems);
        // const itemsMap = {};

        // allItems.forEach(item => {
        //     // console.log('inventoryCont -> item', item.itemId);
        //     // if (!item.itemId) {
        //     //     console.log('ItemiD not found', item);
        //     //     return;
        //     // }
        //     const itemkey = item.itemId._id.toString();
        //     if (!itemsMap[itemkey]) {
        //         itemsMap[itemkey] = {
        //             itemId: itemkey,
        //             name: item.itemId.name,
        //             image: item.itemId.imageUrl,
        //             stock: []
        //         };
        //     }
        //     itemsMap[itemkey].stock.push({
        //         locationId: item.locationId._id.toString(),
        //         locationName: item.locationId.name,
        //         quantity: item.quantity,
        //     });
        // });

        // const itemsWithStock = Object.values(itemsMap)
        // log('allItems length', allItems.length);
        // const totalCount = itemsWithStock.length;
export const getFullInventory = async (req, res) => {
    
    try {
        const pipeline = [ 
            {
                $lookup: {
                    from:   "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as:     "item"
                }
            },
            {
                $unwind: "$item"
            },
            {
                $lookup: {
                    from:       "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as:         "location"
                }
            },
            {
                $unwind: "$location"
            },
            {
                $group: {
                    _id:        "$itemId",
                    name:       { $first: "$item.name" },
                    image:      { $first: "$item.imageUrl" },
                    stock:      {
                        $push: {
                            locationId:     "$location._id",
                            locationName:   "$location.name",
                            quantity:       "$quantity"
                        }
                    },
                    totalStock: {$sum: "$quantity" }
                }
            },

            {
                $project: {
                    _id:        0,
                    itemId:     "$_id",
                    name:       1,
                    image:      1,
                    stock:      1,
                    totalStock: 1
                }
            },

            { $sort: { name: 1 } }
        ];

        const fullInventory = await Inventory.aggregate(pipeline);
        log("inventory.controller -> getFullInventory, inventory:", fullInventory);
        
        res.json(fullInventory);
    } catch (error) {
        log(error.message);
        res.status(500).json({ message: "Error getting full inventory" });
    }
}


// Update item

export const updateInventory = async (type, req, res) => {

    try {
        const { itemId } = req.params;
        const { locationId, quantity, note } = req.body;
        log({locationId, type});
        log("type of itemId, note:", itemId, note)
        const userId = req.user._id;
        // log(req.body);

        if (!['IN', 'OUT', 'TRANSFER'].includes(type)) return res.status(400).json({ error: 'Invalid type!'});
        if (!itemId, !locationId, !quantity) return res.status(400).json({ error: 'Missin required files.'});

        const adjustment = type === 'IN' ? Math.abs(quantity) : -Math.abs(quantity);
        
        

        log({ itemId, locationId, quantity})
        const updatedItem = await Inventory.findOneAndUpdate(
            { itemId, locationId },
            { $inc: { quantity: adjustment } },
            { upsert: true, new: true }
        );
        log(updatedItem)
        if (!updatedItem) return res.status(404).json({ message: "Inventory record not found for this item and location."});
        await logTransaction({
            itemId,
            userId,
            locationId,
            updatedItem,
            type,
            quantity: Math.abs(quantity),
            note, });

        res.json({ success: true, updatedInventory: updatedItem });
        // return res.json(updatedItem);
    } catch (error) {
        // console.error("Update inventory:", error)
        return res.status(500).json({ message: error.message });
    };
};

export async function addStock(req, res) {
    log("req.body", req.body)
    return updateInventory('IN', req, res);
}

export async function removeStock(req, res) {
    return updateInventory('OUT', req, res);
}

export const deleteInventory = async (req, res) => {
    try {
        const deleteItem = await Inventory.findByIdAndDelete(req.params.id);
        if (!deleteItem) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};