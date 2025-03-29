// Creatw  a my sql connection
const mysql = require('mysql2/promise');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const {fetchUserMetadata}=require('./controllers/usermetaController')
const databaseroutes=require('./routes/database')
require('dotenv').config();
const app = express();

// Middleware
app.use(cors()); // Enable All CORS Requests
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);

app.get('/api/user-metadata', fetchUserMetadata);

app.use('/database',databaseroutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
app.set('trust proxy', true);