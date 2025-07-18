// /pages/api/heygen-avatars.js

export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.heygen.com/v1/avatar/list', {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch avatars from HeyGen' });
    }

    const data = await response.json();

    // If HeyGen returns avatars as data.avatars, adjust accordingly
    const avatars = Array.isArray(data) ? data : data.avatars || data || [];

    res.status(200).json({ custom: avatars });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
