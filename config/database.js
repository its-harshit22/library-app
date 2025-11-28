const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'library_db', // Name
    process.env.DB_USER || 'root',       // User
    process.env.DB_PASS || 'YOUR_LOCAL_PASSWORD_HERE', // Local Password
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Needed for Cloud Databases
            }
        }
    }
);

module.exports = sequelize;