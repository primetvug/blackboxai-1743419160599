require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../views')));

// PayPal configuration
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// API Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/index.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/movies.html'));
});

app.get('/subscription', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/subscription.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/payment.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/auth.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});