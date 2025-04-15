import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import generateToken from '../utils/generateToken.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';


export async function  registerUser(req, res) {
    
    try {
        const { name, email , password , role = 'user' } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashed, role });
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
            },
            token,
        });

    } catch (err) {
        console.log('Register user:', err);
        res.status(500).json({ error: 'Server error, please try again later.'});
    }
}

export async function loginUser(req, res) {
    
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        // check password
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) return res.status(400).json({ error: 'Invalid credentials' });
        
        
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
        console.log('Login error:', error);
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
    } catch (err) {
        console.log('Get user error:', err);
        res.status(500).json({ error: 'Server error, Please try again later.'})
    }
}