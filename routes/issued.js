const express = require('express');
const router = express.Router();
const IssuedBook = require('../models/IssuedBook');
const BookCopy = require('../models/BookCopy');
const Book = require('../models/Book');

// 1. GET ALL ISSUED BOOKS
router.get('/', async (req, res) => {
    try {
        const issuedBooks = await IssuedBook.findAll({
            include: [{
                model: BookCopy,
                include: [Book] 
            }]
        });
        res.json(issuedBooks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. ISSUE A BOOK
router.post('/', async (req, res) => {
    try {
        const { copy_id, member_id, member_type, due_date } = req.body;
        
        const copy = await BookCopy.findByPk(copy_id);
        if (!copy || copy.status !== 'Available') {
            return res.status(400).json({ message: 'Book Copy is not available' });
        }

        const newIssue = await IssuedBook.create({
            copy_id, member_id, member_type, due_date, status: 'Issued'
        });

        await copy.update({ status: 'Issued' });

        res.status(201).json(newIssue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. RETURN A BOOK (YAHAN FINE CALCULATION HAI)
router.post('/:id/return', async (req, res) => {
    try {
        const issue = await IssuedBook.findByPk(req.params.id);
        if (!issue || issue.status === 'Returned') {
            return res.status(400).json({ message: 'Invalid or already returned' });
        }

        // --- MATHS START ---
        const today = new Date();
        const dueDate = new Date(issue.due_date);
        
        // Difference in Time
        const diffTime = today - dueDate; 
        
        // Convert Time to Days (Round up)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let fineAmount = 0;
        // Agar late hai, toh ₹10 per day ka fine
        if (diffDays > 0) {
            fineAmount = diffDays * 10; 
        }
        // --- MATHS END ---

        // Update Record
        await issue.update({ 
            status: 'Returned', 
            return_date: today,
            fine: fineAmount 
        });

        // Make Copy Available
        await BookCopy.update(
            { status: 'Available' },
            { where: { id: issue.copy_id } }
        );

        // Frontend ko batao ki fine kitna hai
        res.json({ 
            message: 'Book Returned Successfully', 
            fine: fineAmount,
            daysLate: diffDays > 0 ? diffDays : 0
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;