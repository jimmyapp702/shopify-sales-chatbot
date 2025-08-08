import axios from 'axios';

function adminHeaders() {
  return {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

export async function adminGraphQL(query, variables = {}) {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
  const resp = await axios.post(url, { query, variables }, { headers: adminHeaders() });
  if (resp.data.errors) throw new Error(JSON.stringify(resp.data.errors));
  if (resp.data.data?.userErrors?.length) throw new Error(JSON.stringify(resp.data.data.userErrors));
  return resp.data.data;
}

export async function storefrontGraphQL(query, variables = {}) {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
  const headers = {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const resp = await axios.post(url, { query, variables }, { headers });
  if (resp.data.errors) throw new Error(JSON.stringify(resp.data.errors));
  return resp.data.data;
}

// Helper: WISMO by email/order number (server-side use)
export async function getOrderStatus({ email, orderNumber }) {
  return { summary: 'Use /api/shopify/orderLookup to fetch status.' };
}

// Helper: Product search proxy
export async function searchProducts(nlQuery) {
  try {
    const resp = await fetch(`/api/search/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: nlQuery })
    });
    const data = await resp.json();
    if (!data.results?.length) return 'I didn\'t find matching products. Try a different size or price range?';
    const lines = data.results.map(p => `• ${p.title}${p.price ? ` — ${p.price.amount} ${p.price.currencyCode}` : ''}\n${p.url}`).join('\n\n');
    return `Here are a few options:\n\n${lines}`;
  } catch (e) {
    console.error(e);
    return 'Product search is having a moment—try again shortly.';
  }
}
