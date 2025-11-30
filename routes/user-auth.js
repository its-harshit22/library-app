const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StudentMember = require('../models/StudentMember');
const FacultyMember = require('../models/FacultyMember');

const JWT_SECRET = 'my_super_secret_key_123';

router.post('/login', async (req, res) => {
    const { member_id, password } = req.body;

    try {
        let user = null;
        let role = '';

        // Check if Student
        user = await StudentMember.findOne({ where: { member_id } });
        if (user) role = 'Student';
        
        // If not Student, Check Faculty
        if (!user) {
            user = await FacultyMember.findOne({ where: { member_id } });
            if (user) role = 'Faculty';
        }

        if (!user) return res.status(400).json({ message: 'Invalid Member ID' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Password' });

        const token = jwt.sign({ id: user.id, member_id: user.member_id, role: role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, name: user.name, member_id: user.member_id });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
    // --- CHANGE PASSWORD ROUTE ---
router.post('/change-password', async (req, res) => {
    const { member_id, oldPassword, newPassword } = req.body;

    try {
        let user = null;
        let isStudent = false;

        // 1. Find User (Check Student first, then Faculty)
        user = await StudentMember.findOne({ where: { member_id } });
        if (user) isStudent = true;
        
        if (!user) {
            user = await FacultyMember.findOne({ where: { member_id } });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect Old Password' });

        // 3. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update Database
        if (isStudent) {
            await StudentMember.update({ password: hashedPassword }, { where: { member_id } });
        } else {
            await FacultyMember.update({ password: hashedPassword }, { where: { member_id } });
        }

        res.json({ message: 'Password Updated Successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;