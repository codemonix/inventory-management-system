import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import SidebarDrawer from "./SidebarDrawer.jsx";
import { AuthContext } from "../context/AuthContext.jsx";



const Layout = () => {
    const { user } = useContext(AuthContext);
    console.log("Layout -> user", user);
    return (
        <div className="flex-row bg-gray-300">
            <h1 className="text-center p-3">Welcome <span >{user? user.user.name : ""}</span></h1>
            
            <SidebarDrawer />
            <main className="flex-1">
                {/* <h1>Welcome Layout</h1> */}
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;