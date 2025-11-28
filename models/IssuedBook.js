const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BookCopy = require('./BookCopy');

const IssuedBook = sequelize.define('IssuedBook', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  copy_id: { 
    type: DataTypes.INTEGER,
    references: { model: BookCopy, key: 'id' }
  },
  member_id: { type: DataTypes.STRING, allowNull: false },
  member_type: { type: DataTypes.ENUM('Student', 'Faculty'), allowNull: false },
  issue_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: false },
  return_date: { type: DataTypes.DATE, allowNull: true },
  status: { 
    type: DataTypes.ENUM('Issued', 'Returned', 'Overdue'), 
    defaultValue: 'Issued' 
  },
  // --- NAYA COLUMN: FINE ---
  fine: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }
}, { tableName: 'issued_books', timestamps: true });

IssuedBook.belongsTo(BookCopy, { foreignKey: 'copy_id' });

module.exports = IssuedBook;