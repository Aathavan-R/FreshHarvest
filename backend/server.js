const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freshharvest';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    project: 'FreshHarvest',
    sprint: 'Sprint 1 - Customer Management',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB & Start server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[FreshHarvest] Connected to MongoDB at ${MONGODB_URI}`);

    const server = app.listen(PORT, () => {
      console.log(`[FreshHarvest] Backend API running at http://localhost:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error('[FreshHarvest] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
