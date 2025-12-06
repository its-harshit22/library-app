const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const FacultyMember = require('../models/FacultyMember');
const StudentMember = require('../models/StudentMember');
const { sendLoginDetails } = require('../utils/email'); // <--- Import Email Service

// Helper to generate random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // Generates 8 char random string e.g. "x8k29a1z"
};

// --- GET Routes ---
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await FacultyMember.findAll();
        res.json(faculty);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/students', async (req, res) => {
    try {
        const students = await StudentMember.findAll();
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- POST Routes (Add New) - WITH EMAIL ---
router.post('/faculty', async (req, res) => {
    try {
        const { member_id, name, email, department } = req.body;

        // 1. Generate Random Password
        const plainPassword = generatePassword(); 

        // 2. Hash it for Database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // 3. Save to DB
        const newMember = await FacultyMember.create({
            member_id, name, email, department,
            password: hashedPassword
        });

        // 4. Send Email (Don't wait for it, let it run in background)
        sendLoginDetails(email, name, member_id, plainPassword);

        res.status(201).json(newMember);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/students', async (req, res) => {
    try {
        const { member_id, name, email, course_details } = req.body;

        // 1. Generate Random Password
        const plainPassword = generatePassword(); 

        // 2. Hash it for Database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // 3. Save to DB
        const newMember = await StudentMember.create({
            member_id, name, email, course_details,
            password: hashedPassword
        });

        // 4. Send Email
        sendLoginDetails(email, name, member_id, plainPassword);

        res.status(201).json(newMember);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- DELETE & PUT Routes (Same as before) ---
router.delete('/faculty/:id', async (req, res) => {
    try { await FacultyMember.destroy({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); } 
    catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/students/:id', async (req, res) => {
    try { await StudentMember.destroy({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); } 
    catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/faculty/:id', async (req, res) => {
    try { await FacultyMember.update(req.body, { where: { id: req.params.id } }); res.json({ message: 'Updated' }); } 
    catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/students/:id', async (req, res) => {
    try { await StudentMember.update(req.body, { where: { id: req.params.id } }); res.json({ message: 'Updated' }); } 
    catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;