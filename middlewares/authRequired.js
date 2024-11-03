const jwt = require('jsonwebtoken');
const ROLES = require('../constants/roles')
require('dotenv').config();

const authRequired = (requiredRole) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Access denied, token missing' });
            }

            const secret = process.env.SECRET_KEY;
            const decoded = jwt.verify(token, secret);

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authRequired;
