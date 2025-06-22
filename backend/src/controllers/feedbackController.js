let feedbacks = [];

exports.submitFeedback = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const feedback = { name, email, message, createdAt: new Date() };
  feedbacks.push(feedback);
  res.json({ success: true });
};

exports.getAllFeedback = (req, res) => {
  res.json(feedbacks);
}; 