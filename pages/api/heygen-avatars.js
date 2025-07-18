export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Only GET requests are allowed.' });
  }

  const heygenApiKey = process.env.HEYGEN_API_KEY;
  if (!heygenApiKey) {
    return res.status(500).json({ code: 'HEYGEN_API_KEY_MISSING', message: 'HeyGen API key not configured.' });
  }

  try {
    // Fetch custom talking photo avatars
    const customRes = await fetch('https://api.heygen.com/v1/talking_photo.list', {
      method: 'GET',
      headers: { 'X-Api-Key': heygenApiKey }
    });
    const customData = await customRes.json();

    // Fetch public avatars (optional, can be removed if you only want your own)
    const publicRes = await fetch('https://api.heygen.com/v1/avatar.list', {
      method: 'GET',
      headers: { 'X-Api-Key': heygenApiKey }
    });
    const publicData = await publicRes.json();

    return res.status(200).json({
      custom: customData.data?.talking_photos || [],
      public: publicData.data?.avatars || []
    });
  } catch (error) {
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch avatars.', details: error.message });
  }
}
