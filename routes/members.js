const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const FacultyMember = require('../models/FacultyMember');
const StudentMember = require('../models/StudentMember');

// Note: Email service hata diya gaya hai taaki error na aaye

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

// --- POST Routes (Add New - Default Password: 123456) ---
router.post('/faculty', async (req, res) => {
    try {
        // 1. Default Password Hash karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // 2. Save Member
        const newMember = await FacultyMember.create({
            ...req.body,
            password: hashedPassword
        });

        // 3. Koi Email nahi bhejenge -> Seedha Success response
        res.status(201).json(newMember);
    } catch (err) { 
        console.error(err);
        res.status(400).json({ message: "Error: Member ID might already exist." }); 
    }
});

router.post('/students', async (req, res) => {
    try {
        // 1. Default Password Hash karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // 2. Save Member
        const newMember = await StudentMember.create({
            ...req.body,
            password: hashedPassword
        });

        res.status(201).json(newMember);
    } catch (err) { 
        console.error(err);
        res.status(400).json({ message: "Error: Member ID might already exist." }); 
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