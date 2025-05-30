import axios from 'axios';

// baseURL 끝에 '/'가 붙어 있으면 중복되는 '/' 제거
const rawBaseURL = process.env.SHOPIFY_ADMIN_API_URL || '';
const cleanBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const shopifyApi = axios.create({
  baseURL: cleanBaseURL,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

// GraphQL을 사용한 고객 이메일로 고객 ID 찾기
export async function findCustomerByEmail(email) {
  const query = `
    {
      customers(first: 1, query: "email:${email}") {
        edges {
          node {
            id
            email
          }
        }
      }
    }
  `;

  const res = await shopifyApi.post('/graphql.json', { query });
  const edges = res.data?.data?.customers?.edges;
  if (!edges || edges.length === 0) {
    throw new Error(`No customer found with email: ${email}`);
  }
  return edges[0].node;
}

// 해당 고객의 모든 메타필드 가져오기
export async function getCustomerMetafields(customerId) {
  const res = await shopifyApi.get(`/customers/${customerId}/metafields.json`);
  return res.data.metafields;
}

// 고객 메타필드 저장 또는 덮어쓰기
export async function upsertCustomerMetafield(customerId, namespace, key, value) {
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