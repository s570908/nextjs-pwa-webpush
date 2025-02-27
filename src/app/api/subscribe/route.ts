import { PrismaClient } from '@prisma/client';
import { SubscriptionInfo } from "@/app/pwa-todo/types";
import webPush from 'web-push';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { subscription } = body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    console.log('Invalid subscription:', subscription);
    return new Response(JSON.stringify({ error: 'Invalid subscription data' }), { status: 400 });
  }

  try {
    const data = await prisma.subscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys },
      create: {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
    });
    console.log('Inserted or updated subscription:', data);
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error('Error inserting or updating subscription:', error);
    return new Response(JSON.stringify({ error: 'Failed to insert or update subscription' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.subscription.findMany({
      orderBy: { id: 'asc' },
    });
    return new Response(JSON.stringify(data), { status: 200 });
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
      // 만료되었거나 더 이상 유효하지 않은 구독 처리
      console.error('Subscription has expired or is no longer valid:', error);
      // 데이터베이스에서 구독 제거
      await prisma.subscription.delete({
        where: { endpoint: subscription.endpoint },
      });
    } else {
      console.error('Error sending notification:', error);
    }
  }
}

