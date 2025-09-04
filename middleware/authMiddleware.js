// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied. Admins Only.' });
    }
    next();
};

module.exports = { authMiddleware, isAdmin };
