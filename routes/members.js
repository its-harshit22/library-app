const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const FacultyMember = require('../models/FacultyMember');
const StudentMember = require('../models/StudentMember');
const { sendLoginDetails } = require('../utils/email'); // Email Service Import

// Helper: Random Password Generator
const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // e.g. "a1b2c3d4"
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

// --- POST Routes (Add New + Email) ---
router.post('/faculty', async (req, res) => {
    try {
        // 1. Generate Random Password
        const plainPassword = generatePassword(); 

        // 2. Hash it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // 3. Save to Database
        const newMember = await FacultyMember.create({
            ...req.body,
            password: hashedPassword
        });

        // 4. Send Email via SendGrid
        // (Note: Hum 'await' use nahi kar rahe taaki response fast mile)
        sendLoginDetails(req.body.email, req.body.name, req.body.member_id, plainPassword);

        res.status(201).json(newMember);
    } catch (err) { 
        res.status(400).json({ message: "Error adding faculty. ID might be duplicate." }); 
    }
});

router.post('/students', async (req, res) => {
    try {
        // 1. Generate Random Password
        const plainPassword = generatePassword(); 

        // 2. Hash it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // 3. Save to Database
        const newMember = await StudentMember.create({
            ...req.body,
            password: hashedPassword
        });

        // 4. Send Email via SendGrid
        sendLoginDetails(req.body.email, req.body.name, req.body.member_id, plainPassword);

        res.status(201).json(newMember);
    } catch (err) { 
        res.status(400).json({ message: "Error adding student. ID might be duplicate." }); 
    }
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