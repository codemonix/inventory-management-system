import React from "react";
import { NavLink } from "react-router-dom";
import { getToken } from "../utils/auth.js";

const Sidebar = () => {
    const isAuth = !!getToken

    return (
        <aside className="w-64 bg-gray-800 text-white h-screen p-4">
            {/* Logo or Title */}
            <div className="p-4 test-2xl font-bold">inventory</div>
            <div className="flex flex-col p-4 space-y-2">
                <NavLink to="/dashboard" className={({ isActive }) => 
                    `px-3 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
                    }>
                    Dashboard
                </NavLink>
                <NavLink to="/items"
                className={({ isActive }) => `block px-3 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`}>
                    Items
                </NavLink>

                <NavLink to="/transfers"
                className={({ isActive }) => `block px-3 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`}>
                    Transfers

                </NavLink>
                { isAuth && (<NavLink to="/logout "
                className="mt-auto block px-3 py-2 m-4 rounded bg-red-600 hover:bg-red-500 text-center">
                    Logout
                </NavLink>)}
            </div>
        </aside>
    );
};

export default Sidebar;