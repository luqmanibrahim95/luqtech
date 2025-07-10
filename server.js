require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  console.log('🔐 Akses dashboard:', user?.email || 'Tanpa login');

  if (!user) {
    console.log('🔁 Redirect ke login page');
    res.redirect('/');
    return;
  }

  console.log('📄 Hantar dashboard.html');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Import routes
const companyRoutes = require('./routes/company');
const authRoutes = require('./routes/auth');
const planningRoutes = require('./routes/planning');

app.use('/api', companyRoutes);
app.use('/api', authRoutes);
app.use('/api', planningRoutes);

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server ready di http://localhost:${PORT}`);
  console.log('✅ DB_HOST:', process.env.DB_HOST);
  console.log('✅ DB_PORT:', process.env.DB_PORT);
  console.log('✅ DB_USER:', process.env.DB_USER);
  console.log('✅ DB_NAME:', process.env.DB_NAME);
});