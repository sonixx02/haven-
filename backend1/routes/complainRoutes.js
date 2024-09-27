const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const getComplaintController = require('../controllers/getComplainController');

const upload = require('../middlewares/upload');
router.get('/', getComplaintController.getAllComplaints);
router.post('/upvote/:id', getComplaintController.upvoteComplaint);
router.post('/downvote/:id', getComplaintController.downvoteComplaint);
router.post('/comment/:id', getComplaintController.addComment);
router.post('/verify/:id', getComplaintController.verifyComplaint);

router.post('/', upload.single('image'), complaintController.submitComplaint);

module.exports = router;