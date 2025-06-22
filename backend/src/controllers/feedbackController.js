const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const feedback = new Feedback({ name, email, message, replies: [] });
    await feedback.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit feedback.', message: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve feedback.' });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;
  const adminEmail = req.headers['x-admin-email'];

  if (adminEmail !== 'thisisakshayk@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
  }

  try {
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }
    res.json({ success: true, message: 'Feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback.' });
  }
};

exports.addReply = async (req, res) => {
  const { id } = req.params;
  const { text, authorName, authorEmail } = req.body;

  if (!text || !authorName || !authorEmail) {
    return res.status(400).json({ error: 'Reply text and author information are required.' });
  }

  if (authorEmail !== 'thisisakshayk@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized. Only admins can reply.' });
  }

  try {
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    const reply = { text, authorName, authorEmail, createdAt: new Date() };
    feedback.replies.push(reply);
    await feedback.save();

    res.status(201).json({ success: true, reply: feedback.replies[feedback.replies.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reply.', message: error.message });
  }
};

exports.deleteReply = async (req, res) => {
  const { id, replyId } = req.params;
  const adminEmail = req.headers['x-admin-email'];

  if (adminEmail !== 'thisisakshayk@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
  }

  try {
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    const reply = feedback.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found.' });
    }

    feedback.replies.pull(replyId);
    
    await feedback.save();

    res.json({ success: true, message: 'Reply deleted.' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply.', message: error.message });
  }
}; 