const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book'); // Book se link karein

const BookCopy = sequelize.define('BookCopy', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // Foreign Key: Yeh copy kis kitaab ki hai?
  book_id: { 
    type: DataTypes.INTEGER,
    references: { model: Book, key: 'id' }
  },
  accession_number: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. LIB-001
  status: { 
    type: DataTypes.ENUM('Available', 'Issued', 'Lost', 'Damaged'), 
    defaultValue: 'Available' 
  }
}, { tableName: 'book_copies', timestamps: true });

// Relations setup karein
Book.hasMany(BookCopy, { foreignKey: 'book_id' });
BookCopy.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = BookCopy;