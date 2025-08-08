import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        log("DB_URI:", process.env.DB_URI);
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB connected successfully')
    } catch (error) { 
        console.error('❌ Database connection error:', error);
        throw error;
    }
}

export default connectDB;