const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');  // Import express-session
const bcrypt = require('bcrypt');  // For hashing passwords

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware (Configure session store and secret)
app.use(session({
  secret: '8ff66f4deb4d25ab16b7ec2dbeecbe8e190a1a086a813e9ca15af8757decd4cb',  // Use a strong secret key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // For development, set secure to false
}));

const MONGO_URI = 'mongodb+srv://damaine334:Angulimala123@cluster0.vc4zr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

