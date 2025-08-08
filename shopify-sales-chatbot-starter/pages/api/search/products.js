import { storefrontGraphQL } from '../../../src/lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const q = query.replace(/show me|looking for/ig, '').trim() || 'trunks';
  const gql = `#graphql
    query($q: String!) {
      products(first: 5, query: $q) {
        edges { node {
          id title handle
          variants(first: 10) { edges { node {
            id title availableForSale price { amount currencyCode }
          }}}
          featuredImage { url altText }
        }}
      }
    }`;
  try {
    const data = await storefrontGraphQL(gql, { q });
    const edges = data?.products?.edges || [];
    if (!edges.length) return res.json({ results: [] });
    const items = edges.map(e => ({
      title: e.node.title,
      url: `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${e.node.handle}`,
      price: e.node.variants?.edges?.[0]?.node?.price,
      image: e.node.featuredImage?.url,
      available: e.node.variants?.edges?.some(v => v.node.availableForSale)
    }));
    res.json({ results: items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
}
