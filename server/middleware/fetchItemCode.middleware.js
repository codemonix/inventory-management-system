// Middleware to fetch item code from DB using item _id from request parameters
import  Item  from "../models/item.model.js";
import logger from "../utils/logger.js";



export async function fetchItemCode(req, res, next) {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if (!item) {
            logger.warn("fetchItemCode -> Item not found:", {itemId});
            return res.status(404).json({ error: "Item not found" });
        }
        req.itemCode = item.code;
        next();
    } catch (error) {
        logger.error("fetchItemCode -> Error fetching item code:", error.message);
        res.status(500).json({ error: "Failed to fetch item code" });
    }
}