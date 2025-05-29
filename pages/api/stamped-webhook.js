export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('✅ Webhook 수신:', req.body);
    return res.status(200).json({ message: 'Webhook received' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}