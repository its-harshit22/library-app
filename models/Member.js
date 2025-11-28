// models/Member.js
const { DataTypes } = require('sequelize');
const sequelize =require('../config/database.js'); // Get the connection

const Member = sequelize.define('Member', {
  // 'id' is created automatically
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // No two members can have the same email
  },
  joinedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW // Sets the join date to now
  }
  // 'createdAt' and 'updatedAt' are also added automatically
});

module.exports = Member;