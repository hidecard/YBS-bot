// Vercel serverless function entry point
import handler from './bot.js';

export default async function(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    res.status(500).send('Internal Server Error');
  }
}
