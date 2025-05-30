import axios from 'axios';

// baseURL은 /admin/api/2025-04까지만 포함 (버전 포함)
const rawBaseURL = process.env.SHOPIFY_ADMIN_API_URL || '';
const cleanBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;
const shopifyRestBase = `${cleanBaseURL}`;

// 고객 이메일로 고객 ID 찾기 (REST 방식)
export async function findCustomerByEmail(email) {
  const url = `${shopifyRestBase}customers/search.json?query=email:${email}`;
  console.log('🔍 고객 검색 요청:', url);

  const res = await axios.get(url, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  const customers = res.data.customers;
  if (!customers || customers.length === 0) {
    throw new Error(`No customer found with email: ${email}`);
  }
  return customers[0];
}

// 해당 고객의 모든 메타필드 가져오기
export async function getCustomerMetafields(customerId) {
  console.log('📡 메타필드 GET:', `${shopifyRestBase}customers/${customerId}/metafields.json`);
  const res = await axios.get(`${shopifyRestBase}customers/${customerId}/metafields.json`, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  console.log('📥 메타필드 응답:', res.data);
  return res.data.metafields;
}

// 고객 메타필드 저장 또는 덮어쓰기
export async function upsertCustomerMetafield(customerId, namespace, key, value) {
  console.log(`✍️ 메타필드 POST: ${key} = ${value}`);
  return await axios.post(`${shopifyRestBase}metafields.json`, {
    metafield: {
      namespace,
      key,
      value,
      type: 'single_line_text_field',
      owner_resource: 'customer',
      owner_id: customerId,
    }
  }, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });
}

// ⚠️ 변경 후에는 반드시 Vercel에서 Redeploy 해야 환경변수가 적용됩니다.