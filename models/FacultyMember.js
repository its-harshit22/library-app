const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacultyMember = sequelize.define('FacultyMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  member_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'faculty_members', timestamps: true });

module.exports = FacultyMember;