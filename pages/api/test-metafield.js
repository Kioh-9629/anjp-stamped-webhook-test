import { handleCustomerMetafield } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, height, weight } = req.body;

  try {
    const result = await handleCustomerMetafield(email, height, weight);
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}