
import { Box, Pagination } from "@mui/material";
import { logDebug } from "../utils/logger";

const PaginationControls = ({ page= 1, totalCount = 0, limit = 10, onChange }) => {
    const safeLimit = limit > 0 ? limit : 10;
    const pageCount = Math.max(0, Math.ceil( totalCount / safeLimit ));
    logDebug("PaginationControls -> pageCount:", pageCount, "totalCount:", totalCount, "limit:", limit);

    if ( pageCount <= 1 ) return null;

    return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }} >
            <Pagination 
                count={pageCount}
                page={page}
                onChange={ ( _ , value ) => onChange(value)}
                color="primary"
                showFirstButton
                showLastButton
            />
        </Box>
    );
};

export default PaginationControls;