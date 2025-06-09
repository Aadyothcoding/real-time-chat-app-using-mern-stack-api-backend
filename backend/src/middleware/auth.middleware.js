import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute= (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).send('Unauthorized: No token provided');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).send('Unauthorized: Invalid token');
        }

        const user = User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).send('User not found');
        }
        req.user = user;
        next();

    }catch(error){
        console.error('Error in protectRoute middleware:', error);
        res.status(500).send('Internal Server Error');
    }
}