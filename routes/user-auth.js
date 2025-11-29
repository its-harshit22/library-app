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

module.exports = router;