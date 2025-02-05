import { sql } from "@vercel/postgres";
import { SubscriptionInfo } from "@/app/pwa-todo/types";

export async function POST(req: Request) {
  const { subscription } = await req.json();

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return new Response(JSON.stringify({ error: 'Invalid subscription data' }), { status: 400 });
  }

  console.log("subscribe.POST---subscription: ", subscription);

  try {
    const data = await sql`
      INSERT INTO pwa_subscription (endpoint, keys)
      VALUES (${subscription.endpoint}, ${JSON.stringify(subscription.keys)})
    `;
    return new Response(JSON.stringify({ success: data.rowCount === 1 }), { status: 201 });
  } catch (error) {
    console.error('Error inserting subscription:', error);
    return new Response(JSON.stringify({ error: 'Failed to insert subscription' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await sql<SubscriptionInfo>`
      SELECT *
      FROM pwa_subscription
      ORDER BY id
    `;
    return new Response(JSON.stringify(data.rows), { status: 200 });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { status: 500 });
  }
}

// import { sql } from "@vercel/postgres";
// import { SubscriptionInfo } from "@/app/pwa-todo/types";

// export async function POST(req: Request) {
//   const { subscription } = await req.json();
//   const data = await sql`
//         INSERT INTO pwa_subscription (subscription)
//         VALUES (${subscription})
//     `;
//   return Response.json({ success: data.rowCount === 1 });
// }

// export async function GET() {
//   const data = await sql<SubscriptionInfo>`
//     SELECT *
//     FROM pwa_subscription
//     ORDER BY id
//   `;
//   return Response.json(data.rows);
// }
