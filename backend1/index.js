const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complainRoutes');
const path = require('path');
const app = express();
const port = 3001;
const axios = require('axios')
const Complaint = require('./models/complaint');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve uploaded files

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

app.post('/api/toggleVerification/:id', async (req, res) => {
  const { id } = req.params; // Extract id from route parameters

  try {
    // Find the complaint by ID and toggle the isVerified field
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Toggle the isVerified field
    complaint.isVerified = !complaint.isVerified;

    // Save the updated complaint
    await complaint.save();

    // Respond with the updated complaint
    return res.status(200).json({
      message: `Verification status updated successfully.`,
      updatedComplaint: complaint,
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
// MongoDB connection
mongoose.connect("mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/AapkaRakshaDB?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running on port ${ port }`);
});