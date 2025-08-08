import { adminGraphQL } from '../../../src/lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, orderNumber } = req.body || {};
  if (!email && !orderNumber) return res.status(400).json({ error: 'Provide email or orderNumber' });

  const queryStr = [
    email ? `email:${email}` : null,
    orderNumber ? `name:#${orderNumber}` : null
  ].filter(Boolean).join(' ');

  const query = `#graphql
    query($q: String!) {
      orders(first: 5, query: $q, sortKey: CREATED_AT, reverse: true) {
        edges { node {
          id name orderNumber processedAt financialStatus fulfillmentStatus
          fulfillments {
            trackingInfo { number url company }
            estimatedDeliveryAt
          }
          shippingAddress { firstName lastName city country }
        } }
      }
    }`;

  try {
    const data = await adminGraphQL(query, { q: queryStr });
    const edges = data?.orders?.edges || [];
    if (!edges.length) return res.json({ found:false, message:'No matching orders found.' });

    const node = edges[0].node;
    const f = node.fulfillments?.[0];
    const tracking = f?.trackingInfo?.[0];
    const status = node.fulfillmentStatus || 'UNFULFILLED';
    const summary = status === 'FULFILLED'
      ? `Your order ${node.name} was fulfilled. ${tracking?.company || 'Carrier'} tracking ${tracking?.number || ''} ${tracking?.url ? '('+tracking.url+')' : ''}`
      : `Your order ${node.name} is currently ${status.toLowerCase()}.`;

    return res.json({ found:true, status, tracking, summary, order: node });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Order lookup failed' });
  }
}
