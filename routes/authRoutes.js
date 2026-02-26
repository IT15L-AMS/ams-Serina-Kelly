const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/enrollment', verifyToken, checkPermission('manage_enrollment'), (req, res) => {
    res.json({ message: "Welcome to the Enrollment Portal" });
});

router.get('/grades', verifyToken, checkPermission('manage_grades'), (req, res) => {
    res.json({ message: "Grade Management System" });
});

router.get('/profile', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to your profile",
        user: req.user 
    });
});

module.exports = router;
