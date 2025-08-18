// Vercel serverless function
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
