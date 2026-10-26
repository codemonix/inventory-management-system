import { ReactNode } from "react";
import { logDebug } from "../utils/logger";
import { CircularProgress, LinearProgress } from "@mui/material";
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface StatusHandlerProps {
    status: LoadStatus | undefined;
    error?: string | null;
    children: ReactNode;
    loadingMessage?: string;
    // While reloading data that is already shown, keep it mounted (dimmed) instead of the spinner,
    // so tables keep their scroll position and images are not reloaded on every page change
    keepContentWhileLoading?: boolean;
}

function StatusHandler ( { status, error, children, loadingMessage = 'Loading ...', keepContentWhileLoading = false }: StatusHandlerProps) {
    logDebug("status StatusHandler:", status)
    if ( keepContentWhileLoading && status !== 'failed' ) {
        // Same element tree while loading and after, otherwise React would remount the children
        const isLoading = status === 'loading';
        return (
            <Box sx={{ position: 'relative' }} aria-busy={isLoading}>
                {isLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
                <Box sx={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                    {children}
                </Box>
            </Box>
        );
    }
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
                    { error || "Something went wrong."}
                </Typography>
            </Box>
        );
    }
    return <>{children}</>;
}

export default StatusHandler
