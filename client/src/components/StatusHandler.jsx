import { logDebug } from "../utils/logger";
import { CircularProgress } from "@mui/material";
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

function StatusHandler ( { status, error, children, loadingMessage = 'Loading ...' }) {
    logDebug("status StatusHandler:", status)
    if ( status === 'loading') {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" mt={4} >
                <CircularProgress />
                <Typography variant="body1" mt={2} >
                    {loadingMessage}
                </Typography>
            </Box>
        );
    };
    if ( status === 'failed' )  {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" mt={4} >
                <Typography variant="body1" color="error" >
                     { error || "someting went wrong."}
                </Typography>
            </Box>
        );
    }
    return children;
}

export default StatusHandler