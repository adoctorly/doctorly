require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
app.use(express.json());
// Use port from environment variable or default to 5500
const port = process.env.PORT || 5500;
// ... any other middleware, e.g. bodyParser, cors, etc.

const auth = require('./middleware/auth');
const profileRoutes = require('./routes/profile');

// Allow multiple origins (local and Vercel)
const allowedOrigins = process.env.FRONTEND_URL.split(',');

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Example protected route
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

// ... any other routes
app.use('/api/profile', profileRoutes);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

app.get('/', (req, res) => {
  res.send('Doctorly API Running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
