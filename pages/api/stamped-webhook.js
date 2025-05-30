import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const review = req.body;

    // 저장할 JSON 파일 경로 지정
    const filePath = path.join(process.cwd(), 'data', 'reviews.json');

    // 기존 데이터 불러오기 (없으면 빈 배열)
    let existingReviews = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      existingReviews = JSON.parse(fileData || '[]');
    }

    // 새로운 리뷰 추가
    existingReviews.push({
      ...review,
      receivedAt: new Date().toISOString()
    });

    // JSON 파일로 저장
    fs.writeFileSync(filePath, JSON.stringify(existingReviews, null, 2), 'utf8');

    console.log('✅ 리뷰 저장 완료:', review.email, review.productId);
    return res.status(200).json({ message: 'Webhook received and saved successfully' });

  } catch (error) {
    console.error("❌ Webhook 처리 중 오류:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}