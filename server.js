const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');  // Import express-session
const bcrypt = require('bcrypt');  // For hashing passwords

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icNumber: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  pic1: { type: String },
  pic2: { type: String },
  status: { type: String, default: 'pending' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);

// Define the GET /status route to retrieve the user's status, name, and IC number based on the session
app.get('/status', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'User is not logged in.' });
  }

  try {
    const user = await User.findById(req.session.userId);  // Fetch the user from the database by userId
    if (user) {
      res.json({
        status: user.status || 'pending',  // Return the user's status (or 'pending' if not set)
        name: user.name,                   // Return the user's name
        icNumber: user.icNumber            // Return the user's IC number
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { icNumber, password } = req.body;

  // Ensure both icNumber and password are present
  if (!icNumber || !password) {
    return res.status(400).json({ message: 'IC number and password are required.' });
  }

  // Find the user by IC number
  const user = await User.findOne({ icNumber });
  if (!user) {
    return res.status(400).json({ message: 'Invalid IC number or password.' });
  }

  // Ensure that user.password is defined before comparing
  if (!user.password) {
    return res.status(400).json({ message: 'User password is missing or corrupted.' });
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid IC number or password.' });
  }

  app.post('/register', async (req, res) => {
  const { name, icNumber, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ icNumber });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this IC number already exists.' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user to the database
  const newUser = new User({
    name,
    icNumber,
    password: hashedPassword,  // Store the hashed password
    status: 'pending'  // Default status
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  
  // Store userId in session for session-based authentication
  req.session.userId = user._id;
  res.status(200).json({ message: 'Login successful!' });
});

