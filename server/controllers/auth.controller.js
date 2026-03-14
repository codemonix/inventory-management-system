import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js'



// const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';


export async function  registerUser(req, res) {
    
    try {
        const { name, email , password , role = 'user' } = req.body;
        if ( !name || !email || !password) {
            return res.status(400).json({ message: "All fileds are required" });
        }


        const existing = await User.findOne({ email });
        // log(existing);
        if (existing) {
            logger.info('Email already exist!');
            return res.status(409).json({ error: 'Email already registered' });
        } 

        const hashed = await bcrypt.hash(password, 10);
        const isApproved = process.env.DEFAULT_USER_APPROVED;
        const newUser = new User({ name, email, password: hashed, role, isApproved });
        await newUser.save();

        //JWT token
        const token = generateToken( newUser._id, newUser.role );

        // send back token
        res.status(201).json({ 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isApproved: newUser.isApproved,
            },
            token,
        });

    } catch (error) {
        logger.error('Register user:', error);
        res.status(500).json({ error: 'Server error, please try again later.'});
    }
}

export async function loginUser(req, res) {
    
    try {
        logger.info("auth.controller.js -> loginUser -> req.body:", req.body.email);
        // check if user exists
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            logger.warn("auth.controller.js -> loginUser -> Invalid credentials or inactive account", { email })
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        if (!user.isApproved) {
            logger.warn("auth.controller.js -> loginUser -> Account not approved yet", { email })
            return res.status(403).json({ message: 'Account not approved yet' });
        }

        // check password
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) return res.status(400).json({ error: 'Invalid credentials' });

        user.lastLogin = new Date();
        await user.save();
        
        const token = generateToken(user._id, user.role);


        // send response with token and user info
        res.status(200).json({ 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        logger.error('Login error:', error.message);
        res.status(500).json({ error: 'Something went wrong during login'});
    }

    
}
// Get current user for verification
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send user data
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('auth.controller.js -> getCurrentUser ->  Get user error:', error.message);
        res.status(500).json({ error: 'Server error, Please try again later.'})
    }
}