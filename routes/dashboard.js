const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Needed for date filtering
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const StudentMember = require('../models/StudentMember');
const FacultyMember = require('../models/FacultyMember');
const IssuedBook = require('../models/IssuedBook');

router.get('/stats', async (req, res) => {
    try {
        // --- EXISTING COUNTS ---
        const totalTitles = await Book.count();
        const totalCopies = await BookCopy.count();
        const activeIssues = await IssuedBook.count({ where: { status: 'Issued' } });
        
        const students = await StudentMember.count();
        const faculty = await FacultyMember.count();
        const totalMembers = students + faculty;
        const availableCopies = totalCopies - activeIssues;

        // --- NEW: 1. RECENT ACTIVITIES (Last 5 Actions) ---
        const recentActivities = await IssuedBook.findAll({
            limit: 5,
            order: [['updatedAt', 'DESC']], // Newest first
            include: [{
                model: BookCopy,
                include: [Book] // To get Book Title
            }]
        });

        // --- NEW: 2. BOOKS DUE SOON (Active issues due in next 7 days or overdue) ---
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const dueSoon = await IssuedBook.findAll({
            where: {
                status: 'Issued',
                due_date: {
                    [Op.lte]: nextWeek // Due date is less than or equal to next week
                }
            },
            limit: 5,
            order: [['due_date', 'ASC']], // Earliest due date first
            include: [{
                model: BookCopy,
                include: [Book]
            }]
        });

        res.json({
            totalTitles,
            totalCopies,
            activeIssues,
            totalMembers,
            availableCopies,
            recentActivities, // Sending list 1
            dueSoon           // Sending list 2
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;