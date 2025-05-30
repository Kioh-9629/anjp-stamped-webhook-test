import {
  findCustomerByEmail,
  getCustomerMetafields,
  upsertCustomerMetafield
} from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, height, weight } = req.body;

  try {
    // 1. 고객 조회
    const customer = await findCustomerByEmail(email);
    const customerId = customer.id;

    // 2. 기존 메타필드 확인
    const metafields = await getCustomerMetafields(customerId);
    const existingKeys = metafields.map(m => m.key);

    // 3. height / weight가 없으면 추가
    if (!existingKeys.includes('height') && height) {
      await upsertCustomerMetafield(customerId, 'custom', 'height', height);
    }
    if (!existingKeys.includes('weight') && weight) {
      await upsertCustomerMetafield(customerId, 'custom', 'weight', weight);
    }

    return res.status(200).json({ message: 'Customer metafields updated successfully' });
  } catch (error) {
    console.error('❌ 오류:', error.message);
    if (error.response) {
      console.error('🔍 상태 코드:', error.response.status);
      console.error('🔍 응답 데이터:', error.response.data);
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}