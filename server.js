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
const Admin = require('./models/Admin'); // <--- 1. NEW IMPORT

// --- Import Routes ---
const booksRoutes = require('./routes/books');
const membersRoutes = require('./routes/members');
const issuedRoutes = require('./routes/issued');
const dashboardRoutes = require('./routes/dashboard'); // <--- NEW: Import Dashboard
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
app.use('/api/dashboard', dashboardRoutes); // <--- NEW: Use Dashboard API
app.use('/api/auth', authRoutes); // <--- 3. NEW USE

// --- Database Sync ---
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('✅ Database Synced');
  })
  .catch(err => {
    console.error('❌ Error syncing database:', err);
  });

// --- Page Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/books', (req, res) => res.sendFile(path.join(__dirname, 'public/books.html')));
app.get('/members', (req, res) => res.sendFile(path.join(__dirname, 'public/members.html')));
app.get('/issued', (req, res) => res.sendFile(path.join(__dirname, 'public/issued.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'public/setting.html')));

app.listen(PORT, () => {
  console.log(`📚 Library Server running on http://localhost:${PORT}`);
});