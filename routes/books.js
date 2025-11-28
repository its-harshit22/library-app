const express = require('express');
const router = express.Router();
const sequelize = require('../config/database'); 
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');

// 1. GET ALL BOOKS (With Copy Count)
router.get('/', async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('BookCopies.id')), 'copyCount']
        ]
      },
      include: [{
        model: BookCopy,
        attributes: []
      }],
      group: ['Book.id']
    });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. GET AVAILABLE COPIES OF A BOOK (This was likely missing!)
router.get('/:id/copies', async (req, res) => {
  try {
    const copies = await BookCopy.findAll({
      where: {
        book_id: req.params.id,
        status: 'Available' 
      }
    });
    res.json(copies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. ADD NEW BOOK (Title Info Only)
router.post('/', async (req, res) => {
  try {
    const { title, author, category, isbn } = req.body;
    const newBook = await Book.create({ title, author, category, isbn });
    newBook.dataValues.copyCount = 0; 
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. ADD PHYSICAL COPY
router.post('/:id/copy', async (req, res) => {
  try {
    const bookId = req.params.id;
    const accessionNumber = `LIB-${Date.now()}`; 

    const newCopy = await BookCopy.create({
      book_id: bookId,
      accession_number: accessionNumber,
      status: 'Available'
    });

    res.status(201).json({ message: 'Copy Added', copy: newCopy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. UPDATE BOOK
router.put('/:id', async (req, res) => {
  try {
    await Book.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 6. DELETE BOOK
router.delete('/:id', async (req, res) => {
  try {
    await Book.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;