import {
  findCustomerByEmail,
  getCustomerMetafields,
  upsertCustomerMetafield
} from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, height, weight } = req.body;

  if (!email || !height || !weight) {
    return res.status(400).json({ message: 'email, height, and weight are required' });
  }

  try {
    // 1. 이메일로 고객 찾기
    const customer = await findCustomerByEmail(email);
    console.log('📦 찾은 고객:', customer);
    console.log('📦 customerId:', customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customerId = customer.id;

    // 2. 기존 메타필드 확인
    const metafields = await getCustomerMetafields(customerId);
    const existingKeys = metafields.map(m => m.key);

    // 3. 없으면 새로 저장
    if (!existingKeys.includes('height')) {
      await upsertCustomerMetafield(customerId, 'custom', 'height', height);
    }
    if (!existingKeys.includes('weight')) {
      await upsertCustomerMetafield(customerId, 'custom', 'weight', weight);
    }

    return res.status(200).json({ message: 'Customer metafields updated successfully' });

} catch (error) {
  console.error('❌ 메타필드 처리 오류:', error.message);
  if (error.response) {
    console.error('🪵 응답 데이터:', error.response.data);
    console.error('🪵 상태 코드:', error.response.status);
  }
  return res.status(500).json({ message: 'Internal Server Error' });
}
}