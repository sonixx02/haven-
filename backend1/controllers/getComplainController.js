// Get complaints by district with pagination
exports.getComplaintsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Assuming district is stored in location.district
    const query = { 'location.district': district };
    const complaints = await Complaint.find(query).skip(skip).limit(limit);
    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Complaint = require('../models/complaint');


// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upvote a complaint
exports.upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Downvote a complaint
exports.downvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $inc: { downvotes: 1 } }, { new: true });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  const { user, text } = req.body;
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $push: { comments: { user, text } } }, { new: true });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify a complaint
exports.verifyComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};