export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const avatars = [
    {
      id: 'ae573c3333854730a9077d80b53d97e5',
      name: 'Daisy',
      display_name: 'Daisy from Wealth Mogul',
      value: 'daisy_wealth_mogul',
      type: 'talking_photo'
    },
    {
      id: '7f7b982477074c11b8593d0c60690f0a',
      name: 'Laurier',
      display_name: 'Laurier from Wealth Mogul',
      value: 'laurier_wealth_mogul',
      type: 'talking_photo'
    },
    {
      id: 'f379aa769b474121a59c128ebdcee2ad',
      name: 'Mason',
      display_name: 'Mason from Wealth Mogul',
      value: 'mason_wealth_mogul',
      type: 'talking_photo'
    }
  ];

  return res.status(200).json({
    success: true,
    avatars: avatars,
    total_count: avatars.length
  });
}
