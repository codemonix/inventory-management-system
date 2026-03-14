
import logger from "../utils/logger.js";
import User from "../models/users.model.js"
import  getSortOptions  from "../utils/getSortOptions.js";


// GET /api/users?page=&limit=&search=&sort=
export const getUsers = async ( req, res ) => {
    logger.debug("user.controller.js -> getUsers -> req.body ", req.body)
    try {
        const page = Math.max(parseInt(req.query.page) || 1);
        const limit = Math.max(parseInt(req.query.limit) || 10);
        const search = req.query.search || '';
        const sortParam = req.query.sort || 'name_asc';

        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' }},
                { email: { $regex: search, $options: 'i' }},
            ],
        }
        : {};
        const totalCount = await User.countDocuments(query);

        const users = await User.find(query)
            .sort( getSortOptions(sortParam) )
            .skip(( page - 1 ) * limit )
            .limit( limit );

        logger.debug("user.controller.js -> getUsers -> users:", users)
        return res.status(200).json({ users, totalCount });
    } catch ( error ) {
        logger.debug('user.controller.js -> getUsers -> Error fetching users:', error.message);
        return res.status(500).json({ error: "Internal Server Error"});
    }
};

// PATCH /api/users/:id/toggle-active
export const toggleUserActive = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json(user);
    } catch ( error ) {
        logger.error("user.controller.js -> toggleUserActive -> Error toggling user Active state: ", error.messsage);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, isActive, isApproved } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { name, email, role, isActive, isApproved },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        logger.info("User Updated");
        return res.status(200).json(user);
    } catch (error) {
        logger.error("user.controller.js -> updateUser -> Error updating user:", error.messsage );
        return res.status(500).json({ error: "Internal Server Error"})
    }
};

// PATCH /api/users/:id/toggle-approved
export const toggleUserApproved = async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { isApproved },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        logger.info("User approved status updated")
        return res.status(200).json(user);
    } catch ( error ) {
        logger.error("user.controller.js -> toggleUserApprover -> Error toggling user approved state:", error.messsage);
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

