import React from "react";
import { NavLink } from "react-router-dom";
import { getToken } from "../utils/auth.js";

const Sidebar = () => {
    const linkClass = ({ isActive }) => {
        isActive ? "text-blue-500 font-bold" : "text-white hover:text-blue-300"
    }
    const isAuth = !!getToken();

    return (
        <aside className="w-64 bg-gray-800 text-white h-screen p-4">
            {/* Logo or Title */}
            <div className="p-4 test-2xl font-bold">inventory</div>
            <nav className="flex flex-col p-4 space-y-2">
                <NavLink to="/" className={linkClass}>
                    Home
                </NavLink>
                <NavLink to="/dashboard" className={ linkClass } >
                    Dashboard
                </NavLink>
                <NavLink to="/items" className={ linkClass }>
                    Items
                </NavLink>
                <NavLink to="/transfers" className={ linkClass }>
                    Transfers
                </NavLink>
                { isAuth && (<NavLink to="/logout "
                className="mt-auto block px-3 py-2 m-4 rounded bg-red-600 hover:bg-red-500 text-center">
                    Logout
                </NavLink>)}
            </nav>
        </aside>
    );
};

export default Sidebar;