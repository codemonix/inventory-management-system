
import { Pagination } from "@mui/material";
import Box from "@mui/material/Box";

const PaginationControls = ({ page, totalCount, limit, onChange }) => {
    const pageCount = Math.ceil( totalCount / limit );

    if ( pageCount <= 1 ) return null;

    return (
        <Box display="flex" justifyContent="center" mt={4} mb={4} >
            <Pagination 
                count={pageCount}
                page={page}
                onChange={ ( _ , Value ) => onChange(Value)}
                color="primary"
                showFirstButton
                showLastButton
            />

        </Box>
    );
};

export default PaginationControls;