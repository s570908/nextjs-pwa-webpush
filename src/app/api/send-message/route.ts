import webPush, { PushSubscription, sendNotification } from "web-push";

export async function POST(req: Request) {

try {
  const { pushSubscription, title, message } = await req.json();

  //console.log("send-message.POST---pushSubscription, title, message: ", pushSubscription, title, message);

  if (!pushSubscription || !title || !message) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), { status: 400 });
  }

  const subscription = pushSubscription as PushSubscription;
  const payload = JSON.stringify({ title, message });  

  if (
    !process.env.VAPID_SUBJECT ||
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
  ) {
    console.error("VAPID key 정보가 없습니다.");
    return Response.error();
  }

  const options = {
    vapidDetails: {
      subject: process.env.VAPID_SUBJECT,
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    },
    TTL: 60,
  };

  // sendNotification 함수 사용
  await sendNotification(subscription, payload, options);
//   
  return new Response(JSON.stringify({ success: true }), { status: 201 });
} catch (error) {
  console.error('Error sending notification:', error);
  return new Response(JSON.stringify({ error: 'Failed to send notification' }), { status: 500 });
}
}
