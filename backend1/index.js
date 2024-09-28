const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const axios = require('axios');

require('dotenv').config(); // 

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const OPENCAGE_API_KEY = 'fb95d3f1d839476f8d8fc209dd4a0aa0'; // Replace with your OpenCage API key

app.use(express.json());

app.post('/api/log-location', (req, res) => {
  const { latitude, longitude } = req.body;
  console.log(`User location: ${latitude}, ${longitude}`);
  res.json({ message: 'Location logged successfully' });
});

// Function to get coordinates from destination using OpenCage API
async function getCoordinatesFromDestination(destination) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${OPENCAGE_API_KEY}`;
    const response = await axios.get(url);

    if (response.data && response.data.results && response.data.results.length > 0) {
      const { geometry } = response.data.results[0];
      return { latitude: geometry.lat, longitude: geometry.lng };
    } else {
      return null; // No coordinates found
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error.response ? error.response.data : error.message);
    return null; // Handle error and return null
  }
}

app.post('/api/get-destination', async (req, res) => {
  try {
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const coordinates = await getCoordinatesFromDestination(destination);
  
    if (coordinates) {
      res.status(200).json(coordinates);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    console.error('Error in /api/get-destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.use('/api/users', userRoutes);
// MongoDB connection
mongoose.connect("mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/ApniSehatDatabase?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running on port ${ port }`);
});