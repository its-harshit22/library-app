const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentMember = sequelize.define('StudentMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  member_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  course_details: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  // --- NEW COLUMN ---
  password: { type: DataTypes.STRING, allowNull: false } 
}, { tableName: 'student_members', timestamps: true });

module.exports = StudentMember;