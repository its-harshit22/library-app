const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = 'my_super_secret_key_123'; // Change this in production

// 1. SETUP ROUTE (Run this once to create the first Admin)
router.post('/setup', async (req, res) => {
    try {
        // Check if admin already exists
        const count = await Admin.count();
        if (count > 0) return res.status(400).json({ message: "Admin already exists!" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); // Default Password: admin123

        // Create Admin
        await Admin.create({ username: 'admin', password: hashedPassword });
        res.json({ message: 'Admin Account Created Successfully!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find User
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) return res.status(400).json({ message: 'User not found' });

        // Check Password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // Generate Token (The "ID Card")
        const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ 
            message: 'Login Successful', 
            token: token, 
            username: admin.username 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. UPDATE PASSWORD (For Settings Page)
router.post('/update', async (req, res) => {
    const { oldUsername, oldPassword, newUsername, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({ where: { username: oldUsername } });
        if (!admin) return res.status(400).json({ message: 'User not found' });

        // Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect Current Password' });

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await admin.update({ username: newUsername, password: hashedPassword });
        res.json({ message: 'Credentials Updated! Please login again.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;