import { Pagination, Box } from "@mui/material";

interface PaginationControlsProps {
    page?: number;
    totalCount?: number;
    limit?: number;
    onChange: (page: number) => void;
}

const PaginationControls = ({ page = 1, totalCount = 0, limit = 10, onChange }: PaginationControlsProps) => {
    const safeLimit = limit > 0 ? limit : 10;
    const pageCount = Math.max(0, Math.ceil(totalCount / safeLimit));
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination 
                count={pageCount}
                page={page}
                onChange={(_, value) => onChange(value)} 
                color="primary"
                showFirstButton
                showLastButton
                disabled={pageCount <= 1} // Disables instead of vanishing!
            />
        </Box>
    );
};

export default PaginationControls;