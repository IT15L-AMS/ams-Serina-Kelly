const jwt = require('jsonwebtoken');
const db = require('../config/ams_db');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "No Token Provided" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const [rows] = await db.execute(
                `SELECT p.permission_name 
                 FROM permissions p
                 JOIN role_permissions rp ON p.permission_id = rp.permission_id
                 JOIN roles r ON rp.role_id = r.role_id
                 WHERE r.role_name = ? AND p.permission_name = ?`,
                [req.user.role, requiredPermission]
            );

            if (rows.length === 0) {
                return res.status(403).json({ message: "Forbidden: You do not have permission to " + requiredPermission });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
};

module.exports = { verifyToken, checkPermission };
