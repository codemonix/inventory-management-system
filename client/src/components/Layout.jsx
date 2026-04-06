import { Outlet, useLocation } from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { logDebug } from "../utils/logger.js";
import { useEffect } from "react";

const ROUTE_NAMES = {
    '/dashboard': 'Dashboard',
    '/items': 'Items',
    '/locations': 'Locations',
    '/users': 'Users',
    '/logs': 'Logs',
    '/transfers': 'Transfer Manager',
}

const Layout = () => {

    const { user } = useAuth();
    const location = useLocation();

    const pageName = ROUTE_NAMES[location.pathname] || 'App';
    const userName = user?.user?.name;
    

    useEffect(() => {
        const titlePrefix = userName ? `${userName} | ` : '';
        document.title = `${titlePrefix}${pageName}`;
    },[location.pathname, userName, pageName])

    logDebug("Layout.jsx -> user", user);
    return (
        <div className="flex flex-col min-h-screen bg-gray-300">
            <h1 className="text-center p-3"><span >{user?.user?.name}</span> | {pageName} </h1>
            <SidebarDrawer />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;