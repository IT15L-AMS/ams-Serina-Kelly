const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: "Welcome to your profile", user: req.user });
});

router.get('/admin-only', verifyToken, authorizeRole(['Admin']), (req, res) => {
    res.json({ message: "Hello Admin, you have secret access!" });
});

module.exports = router;