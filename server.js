// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const parseUser = require('./middleware/parseUser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(parseUser);
app.use(express.static(path.join(__dirname, 'public')));

// Protected route untuk dashboard
app.get('/dashboard.html', (req, res) => {
  const user = req.user;

  console.log('🔐 Akses dashboard:', user?.email || 'Tanpa login');

  if (!user) {
    console.log('🔁 Redirect ke login page');
    return res.redirect('/');
  }

  console.log('📄 Hantar dashboard.html');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import routes
const companyRoutes = require('./routes/company');
const authRoutes = require('./routes/auth');
const planningRoutes = require('./routes/planning');
const orgChartRoute = require('./routes/org_chart');
const departmentRoutes = require('./routes/department');

app.use('/api', companyRoutes);
app.use('/api', authRoutes);
app.use('/api', planningRoutes);
app.use('/api/org-chart', orgChartRoute); 
app.use('/api/departments', departmentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server ready di http://localhost:${PORT}`);
  console.log('✅ DB_HOST:', process.env.DB_HOST);
  console.log('✅ DB_PORT:', process.env.DB_PORT);
  console.log('✅ DB_USER:', process.env.DB_USER);
  console.log('✅ DB_NAME:', process.env.DB_NAME);
});
