import { sql } from "@vercel/postgres";
import { SubscriptionInfo } from "@/app/pwa-todo/types";
import webPush from 'web-push';

export async function POST(req: Request) {
  const body = await req.json();
  const { subscription } = body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    console.log('Invalid subscription:', subscription);
    return new Response(JSON.stringify({ error: 'Invalid subscription data' }), { status: 400 });
  }

  try {
    const data = await sql`
      INSERT INTO pwa_subscription (endpoint, keys)
      VALUES (${subscription.endpoint}, ${JSON.stringify(subscription.keys)})
      ON CONFLICT (endpoint) DO UPDATE
      SET keys = EXCLUDED.keys
    `;
    console.log('Inserted or updated subscription:', data);
    return new Response(JSON.stringify({ success: data.rowCount === 1 }), { status: 201 });
  } catch (error) {
    console.error('Error inserting or updating subscription:', error);
    return new Response(JSON.stringify({ error: 'Failed to insert or update subscription' }), { status: 500 });
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

export async function sendNotification(subscription: webPush.PushSubscription, payload: string, options: webPush.RequestOptions) {
  try {
    await webPush.sendNotification(subscription, payload, options);
  } catch (error) {
    if ((error as any).statusCode === 410) {
      // Handle expired or unsubscribed subscription
      console.error('Subscription has expired or is no longer valid:', error);
      // Remove the subscription from your database
      await sql`
        DELETE FROM pwa_subscription
        WHERE endpoint = ${subscription.endpoint}
      `;
    } else {
      console.error('Error sending notification:', error);
    }
  }
}

