import axios from 'axios';

const SHOPIFY_URL = 'https://andar-jp.myshopify.com/admin/api/2025-04/graphql.json';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

// 1. 공통 GraphQL 요청 함수
export async function queryShopifyGraphQL(query) {
  const response = await axios.post(SHOPIFY_URL, { query }, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    }
  });

  return response.data;
}

// 2. 고객 메타필드 처리 로직
export async function handleCustomerMetafield(email, height, weight) {
  // (1) 고객 조회 쿼리
  const customerQuery = `
    {
      customers(first: 1, query: "email:${email}") {
        edges {
          node {
            id
            email
            metafields(first: 10, namespace: "custom") {
              edges {
                node {
                  id
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await queryShopifyGraphQL(customerQuery);
  const customer = data?.data?.customers?.edges?.[0]?.node;

  if (!customer) {
    throw new Error(`Customer not found: ${email}`);
  }

  const customerId = customer.id;
  const existingKeys = customer.metafields.edges.map(edge => edge.node.key);

  const mutations = [];

  // (2) 필요한 경우 height 추가
  if (!existingKeys.includes('height') && height) {
    mutations.push(`
      height: metafieldsSet(metafields: [{
        namespace: "custom",
        key: "height",
        type: "single_line_text_field",
        value: "${height}",
        ownerId: "${customerId}"
      }]) {
        userErrors {
          field
          message
        }
      }
    `);
  }

  // (3) 필요한 경우 weight 추가
  if (!existingKeys.includes('weight') && weight) {
    mutations.push(`
      weight: metafieldsSet(metafields: [{
        namespace: "custom",
        key: "weight",
        type: "single_line_text_field",
        value: "${weight}",
        ownerId: "${customerId}"
      }]) {
        userErrors {
          field
          message
        }
      }
    `);
  }

  // (4) 메타필드 저장 요청
  if (mutations.length > 0) {
    const mutationQuery = `
      mutation {
        ${mutations.join('\n')}
      }
    `;
    const result = await queryShopifyGraphQL(mutationQuery);
    return result;
  }

  return { message: 'No new metafields to set' };
}