const express = require('express');
const router = express.Router();
const IssuedBook = require('../models/IssuedBook');
const BookCopy = require('../models/BookCopy');
const Book = require('../models/Book');

router.get('/my-books/:member_id', async (req, res) => {
    try {
        const myBooks = await IssuedBook.findAll({
            where: { member_id: req.params.member_id },
            include: [{
                model: BookCopy,
                include: [Book]
            }]
        });
        res.json(myBooks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;