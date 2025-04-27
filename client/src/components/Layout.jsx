import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";


const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                {/* <h1>Welcome Layout</h1> */}
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;