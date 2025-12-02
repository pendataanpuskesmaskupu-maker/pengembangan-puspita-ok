// This is a Vercel Serverless Function that acts as a secure bridge.
// It runs on the server, reads the secret API_KEY from environment variables,
// and sends it to the client-side application upon request.

export default function handler(req, res) {
  // Ensure this is only accessible via GET requests for security
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // This will show up in Vercel's server logs if the environment variable is not set correctly.
    console.error("Vercel Serverless Function Error: API_KEY is not defined in environment variables.");
    res.status(500).json({ error: 'API Key is not configured on the server.' });
    return;
  }

  // Send the API key to the client
  res.status(200).json({ apiKey });
}
