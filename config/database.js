const Sequelize = require('sequelize');

// Logic:
// Jab hum Render par honge, toh wo 'process.env' se details uthayega.
// Jab Laptop par honge, toh wo 'library_db' aur 'root' use karega.

const sequelize = new Sequelize(
    process.env.DB_NAME || 'library_db',     // Cloud Name OR Local Name
    process.env.DB_USER || 'root',           // Cloud User OR Local User
    process.env.DB_PASS || 'your_local_password', // Cloud Pass OR Local Pass
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true, // TiDB Cloud ke liye zaroori hai
                rejectUnauthorized: false 
            }
        }
    }
);

module.exports = sequelize;