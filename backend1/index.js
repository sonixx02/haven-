const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complainRoutes');
const path = require('path');

require('dotenv').config(); // 



const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve uploaded files

app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
// MongoDB connection
mongoose.connect("mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/AapkaRakshaDB?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running on port ${ port }`);
});