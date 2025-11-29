const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // <--- Import bcrypt
const FacultyMember = require('../models/FacultyMember');
const StudentMember = require('../models/StudentMember');

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

// --- POST Routes (Add New) - UPDATED WITH PASSWORD ---
router.post('/faculty', async (req, res) => {
    try {
        // Hash default password '123456'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const newMember = await FacultyMember.create({
            ...req.body,
            password: hashedPassword // <--- Auto-add password
        });
        res.status(201).json(newMember);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/students', async (req, res) => {
    try {
        // Hash default password '123456'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const newMember = await StudentMember.create({
            ...req.body,
            password: hashedPassword // <--- Auto-add password
        });
        res.status(201).json(newMember);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- DELETE Routes ---
router.delete('/faculty/:id', async (req, res) => {
    try {
        await FacultyMember.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/students/:id', async (req, res) => {
    try {
        await StudentMember.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- PUT Routes ---
router.put('/faculty/:id', async (req, res) => {
    try {
        await FacultyMember.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/students/:id', async (req, res) => {
    try {
        await StudentMember.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;