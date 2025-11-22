import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, access denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid, user not found'
            });
        }

        if (user.status !== 'Active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is not active. Please contact administrator.'
            });
        }

        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role
        };
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
            error: error.message
        });
    }
};

export default authMiddleware;