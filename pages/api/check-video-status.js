export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Only GET requests are allowed.' });
  }

  const { videoId } = req.query;
  const heygenApiKey = process.env.HEYGEN_API_KEY;
  if (!heygenApiKey) {
    return res.status(500).json({ code: 'HEYGEN_API_KEY_MISSING', message: 'HeyGen API key not configured.' });
  }
  if (!videoId) {
    return res.status(400).json({ code: 'VIDEO_ID_REQUIRED', message: 'videoId is required.' });
  }

  try {
    const response = await fetch(`https://api.heygen.com/v1/video.status?video_id=${videoId}`, {
      headers: { 'X-Api-Key': heygenApiKey }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch video status.', details: error.message });
  }
}
