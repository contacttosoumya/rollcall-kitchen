/**
 * src/repositories/posOrders.repository.js
 * Data access for pos_orders — see that migration's comment for the full
 * rationale. This is intentionally a thin, generic insert: any future
 * webhook (DoorDash, Uber Eats, a real POS) or manual staff entry writes
 * through the same shape.
 */
async function insertPosOrder(client, { externalOrderId, source, customerEmail, customerPhone, subscriberId, amountCents, pointsAwarded, rawPayload = {} }) {
  const { rows } = await client.query(
    `INSERT INTO pos_orders
       (external_order_id, source, customer_email, customer_phone, subscriber_id, amount_cents, points_awarded, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, created_at`,
    [
      externalOrderId || null,
      source,
      customerEmail || null,
      customerPhone || null,
      subscriberId || null,
      amountCents,
      pointsAwarded,
      JSON.stringify(rawPayload),
    ]
  );
  return rows[0];
}

module.exports = { insertPosOrder };