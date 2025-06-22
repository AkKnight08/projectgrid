const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// @route   POST api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', feedbackController.submitFeedback);

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Public
router.get('/', feedbackController.getAllFeedback);

// @route   DELETE api/feedback/:id
// @desc    Delete a feedback entry
// @access  Private (Admin Only)
router.delete('/:id', feedbackController.deleteFeedback);

// @route   POST api/feedback/:id/replies
// @desc    Add a reply to a feedback entry
// @access  Private (Admin Only)
router.post('/:id/replies', feedbackController.addReply);

// @route   DELETE api/feedback/:id/replies/:replyId
// @desc    Delete a reply from a feedback entry
// @access  Private (Admin Only)
router.delete('/:id/replies/:replyId', feedbackController.deleteReply);

module.exports = router; 