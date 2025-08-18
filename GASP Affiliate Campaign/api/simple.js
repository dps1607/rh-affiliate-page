module.exports = (req, res) => {
  res.json({
    success: true,
    message: 'Simple API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
