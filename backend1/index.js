const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config(); // 


const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
// MongoDB connection
mongoose.connect("mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/ApniSehatDatabase?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running on port ${ port }`);
});