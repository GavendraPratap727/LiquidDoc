require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('LiquidDoc API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const server = app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server running on port ${server.address().port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Try the next port number
    const port = parseInt(process.env.PORT || 3000) + 1;
    console.log(`Port ${port - 1} is in use, trying port ${port}...`);
    process.env.PORT = port;
    const newServer = app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
