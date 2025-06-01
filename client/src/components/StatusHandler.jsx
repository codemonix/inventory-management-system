import { logDebug } from "../utils/logger";

function StatusHandler ( { status, error, children }) {
    logDebug("status StatusHandler:", status)
    if ( status === 'loading') return <p>Loading ....</p>;
    if ( status === 'failed' ) return <p>Error: {error}</p>;
    return children;
};

export default StatusHandler