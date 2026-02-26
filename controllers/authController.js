const db = require('../config/ams_db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role_name } = req.body;

        if (!first_name || !last_name || !email || !password || !role_name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const [roles] = await db.execute('SELECT role_id FROM roles WHERE role_name = ?', [role_name]);
        if (roles.length === 0) {
            return res.status(400).json({ message: "Invalid role selected" });
        }
        const role_id = roles[0].role_id;

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, role_id]
        );

        res.status(201).json({ 
            success: true, 
            message: "Registered successfully!" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const [users] = await db.execute(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS full_name, 
                    u.password_hash, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             WHERE u.email = ? AND u.is_deleted = 0`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role_name, name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            user: {
                id: user.user_id,
                name: user.full_name,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE users SET is_deleted = 1 WHERE user_id = ?', [id]);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user" });
    }
};
