const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/database');

// --- Import ALL Models ---
const Book = require('./models/Book');
const BookCopy = require('./models/BookCopy');
const FacultyMember = require('./models/FacultyMember');
const StudentMember = require('./models/StudentMember');
const IssuedBook = require('./models/IssuedBook');
const Admin = require('./models/Admin');

// --- Import Routes ---
const booksRoutes = require('./routes/books');
const membersRoutes = require('./routes/members');
const issuedRoutes = require('./routes/issued');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');

const app = express();

// --- PORT SETTING ---
const PORT = process.env.PORT || 4000; 

// --- Middleware ---
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- API Routes ---
app.use('/api/books', booksRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/issued', issuedRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user-auth', require('./routes/user-auth'));
app.use('/api/user-dashboard', require('./routes/user-dashboard'));

// --- Database Sync ---
// Check if we need to wipe the database (useful for fixing cloud errors)
// --- Database Sync ---
// Force: true wipes the database. Use ONLY when fixing schema errors.
const forceReset = process.env.FORCE_DB_RESET === 'true';

sequelize.sync({ alter: true, force: forceReset }) 
  .then(() => {
    console.log(`✅ Database Synced (Force Reset: ${forceReset})`);
  })
  .catch(err => {
    console.error('❌ Error syncing database:', err);
  });

// --- PAGE ROUTES (Updated for Landing Page Strategy) ---

// 1. Root '/' -> Landing Page (Select Student/Admin)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 2. Admin Dashboard -> The actual Admin Panel
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
});

// 3. Other Admin Pages
app.get('/books', (req, res) => res.sendFile(path.join(__dirname, 'public/books.html')));
app.get('/members', (req, res) => res.sendFile(path.join(__dirname, 'public/members.html')));
app.get('/issued', (req, res) => res.sendFile(path.join(__dirname, 'public/issued.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'public/setting.html')));

// 4. User Pages
app.get('/user-login.html', (req, res) => res.sendFile(path.join(__dirname, 'public/user-login.html')));
app.get('/user-dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'public/user-dashboard.html')));


// --- START SERVER (0.0.0.0 for Mobile Access) ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📚 Library Server running on http://0.0.0.0:${PORT}`);
});