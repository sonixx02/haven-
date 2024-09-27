const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  image: { type: String }, 
   // Store the image path or URL
   userDetailss:{
userEmail:{type:String}
   },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  geminiAnalysis: {
    imageDescription: { type: String },
    descriptionMatch: { type: String },
    incidentLevel: { type: String },
    additionalDetails: { type: String }
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
  comments: [{ 
    user: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
