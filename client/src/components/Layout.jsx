import { Outlet, useLocation } from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { logDebug } from "../utils/logger.js";
import { useEffect, useState } from "react";


const Layout = () => {

    const { user } = useAuth();
    const location = useLocation();
    const [pageName, setPageName] = useState('');

    useEffect(() => {
        const routeNames = {
            '/dashboard': 'Dashboard',
            '/items': 'Items',
            '/locations': 'Locations',
            '/users': 'Users',
            '/logs': 'Logs',
            '/transfers': 'Transfers',
        };

        setPageName(routeNames[location.pathname] || 'App');

        const titlePrefix = user?.user?.name ? `${user.user.name} | ` : '';
        document.title = `${titlePrefix}${pageName}`;
    },[location.pathname, user?.user?.name])

    logDebug("Layout.jsx -> user", user);
    return (
        <div className="flex-row bg-gray-300">
            <h1 className="text-center p-3"><span >{user?.user?.name}</span> | {pageName} </h1>
            <SidebarDrawer />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;