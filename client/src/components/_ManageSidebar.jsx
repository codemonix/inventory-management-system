import { useState} from "react";
import { NavLink } from "react-router-dom";
import InventoryIcon from '@mui/icons-material/Inventory';
import { getToken } from "../utils/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import  AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


const ManageSideDrawer = () => {

    const { isAdmin, isManager } = useAuth();
    console.log("Sidebar -> isAdmin", isAdmin);
    console.log("Sidebar -> isManager", isManager);

    const links = [
        { to: "/manage", label: "Home" },
        { to: "/manage/users", label: "Users" },
        { to: "/manage/logs", label: "Logs" },
        { to: "/manage/settings", label: "Settings" },
    ]

    const linkClass = ({ isActive }) => {
        return isActive ? "text-blue-500 font-bold" : "text-white hover:text-blue-500";
    };
    
    const isAuth = !!getToken();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };



    return (
        <div className="relative lg:flex">
            <div className="lg:hidden p-4">
                <button onClick={toggleSidebar} className="text-gray-500 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                                />
                        </svg>
                </button>
            </div>
            <aside className={`flex flex-col bg-gray-800 text-white w-64 p-4 space-y-4 absolute lg:relative 
                    transition-transform transform h-screen 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
                <h1 className="p-4 text-2xl font-bold">inventory</h1>
                <nav className="flex flex-col p-4 space-y-2">
                    <NavLink to="/" className={linkClass}>
                        Home
                    </NavLink>
                    <NavLink to="/dashboard" className={ linkClass } >
                        <InventoryIcon fontSize="small" />
                        <span className="ml-2">Dashboard</span>
                    </NavLink>
                    <NavLink to="/items" className={ linkClass }>
                        Items
                    </NavLink>
                    <NavLink to="/locations" className={ linkClass }>
                        Locations
                    </NavLink>
                    <NavLink to="/transfers" className={ linkClass }>
                        Transfers
                    </NavLink>
                   
                    
                    
                </nav>
            </aside>
            <div className={`lg:ml-56 p-4`}>

            </div>
        </div>
    );
};

export default ManageSideDrawer;