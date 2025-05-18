import { Box } from "@mui/material";
import ItemCardTransfer from "./ItemCardTransfer.jsx";
import { logInfo } from "../utils/logger.js";

export default function TransferItemsList({ items }) {
    logInfo("items:", items)
    if (!items || items.length === 0) {
        return <p style={{ textAlign: "center", color: "#666"}} > No items in this transfer. </p>;
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} >
            { items.map((itm) => (
                <ItemCardTransfer key={itm._id} item={itm} />
            ))}
        </Box>
    )
}