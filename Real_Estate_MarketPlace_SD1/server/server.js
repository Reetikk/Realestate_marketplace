require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const mapRoutes = require('./routes/mapRoutes');

const app = express();
const port = process.env.PORT || 5001;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow tools such as curl/Postman, and configured browser origins.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Real Estate API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/map', mapRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Real Estate API running at http://localhost:${port}`));
  } catch (error) {
    console.error('Could not start the API:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
