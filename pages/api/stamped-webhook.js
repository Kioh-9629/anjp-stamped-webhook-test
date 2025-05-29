export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const data = req.body;

    console.log("📩 Received Stamped Webhook:");
    console.log(JSON.stringify(data, null, 2));

    // 나중에 여기서 customer email, productId, rating 등 추출해서 저장하면 됨
    return res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}