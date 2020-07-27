const express = require('express');
const config = require('config');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');

const connectDB = require('./config/db');

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('DevConnector API server ...');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`===> Connected to DevConnector API server port ${PORT}`);
});
