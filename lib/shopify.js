import axios from 'axios';

const shopifyApi = axios.create({
  baseURL: process.env.SHOPIFY_ADMIN_API_URL,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

// 고객 이메일로 고객 ID 찾기
export async function findCustomerByEmail(email) {
  const fullUrl = shopifyApi.defaults.baseURL + `/customers/search.json?query=email:${email}`;
  console.log('➡️ 고객 조회 요청 URL:', fullUrl);
  console.log('➡️ 토큰 일부:', process.env.SHOPIFY_ADMIN_API_TOKEN?.slice(0, 8) + '...');

  const res = await shopifyApi.get(`/customers/search.json?query=email:${email}`);
  if (res.data.customers.length === 0) {
    throw new Error(`No customer found with email: ${email}`);
  }
  return res.data.customers[0];
}

// 해당 고객의 모든 메타필드 가져오기
export async function getCustomerMetafields(customerId) {
  const res = await shopifyApi.get(`/customers/${customerId}/metafields.json`);
  return res.data.metafields;
}

// 고객 메타필드 저장 또는 덮어쓰기
export async function upsertCustomerMetafield(customerId, namespace, key, value) {
  console.log(`📝 메타필드 저장 요청: ${namespace}.${key} = ${value} (for customerId: ${customerId})`);
  return await shopifyApi.post(`/metafields.json`, {
    metafield: {
      namespace,
      key,
      value,
      type: 'single_line_text_field',
      owner_resource: 'customer',
      owner_id: customerId,
    }
  });
}