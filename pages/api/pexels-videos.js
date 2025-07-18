export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Only GET requests are allowed.' });
  }

  const { query = 'real estate', per_page = 8 } = req.query;
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    return res.status(500).json({ code: 'PEXELS_API_KEY_MISSING', message: 'Pexels API key not configured.' });
  }

  try {
    const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${per_page}`, {
      headers: { Authorization: pexelsApiKey }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch Pexels videos.', details: error.message });
  }
}
