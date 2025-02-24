"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { IconButton, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import { SubscriptionInfo } from "@/app/pwa-todo/types";

export default function Header() {
  const [alertGranted, setAlertGranted] = useState<boolean>();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setAlertGranted(Notification.permission === "granted");
    }
  }, []);

// PushSubscription을 가져오는 함수
async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error("VAPID Public key가 존재하지 않습니다.");
      return null;
    }

    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      console.error("ServiceWorkerRegistration을 찾을 수 없습니다.");
      return null;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const existingKey = subscription.options.applicationServerKey;
      const newKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

      if (existingKey && !compareUint8Arrays(new Uint8Array(existingKey), newKey)) {
        await subscription.unsubscribe();
        subscription = null;
      } else {
        // 기존 구독이 있는 경우, 서버에 갱신 요청을 보냅니다.
        await updateSubscriptionOnServer(subscription);
      }
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });
      // 새로운 구독을 서버에 저장합니다.
      await updateSubscriptionOnServer(subscription);
    }

    console.log("getPushSubscription--subscription: ", subscription);

    return subscription;
  } catch (e) {
    console.error("PushSubscription을 가져오는 동안 오류가 발생했습니다: ", e);
    return null;
  }
}

// 서버에 구독 정보를 갱신하는 함수
async function updateSubscriptionOnServer(subscription: PushSubscription) {
  try {
    const response = await axios.post('/api/subscribe', {
      subscription,
    });

    if (response.status !== 201) {
      throw new Error('Failed to update subscription on server');
    }
  } catch (error) {
    console.error('Error updating subscription on server:', error);
  }
}

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function compareUint8Arrays(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // 서버에 PushSubscription을 저장하는 함수
  async function savePushSubscription(subscription: PushSubscription | null) {
    if (!subscription) {
      console.error("PushSubscription이 존재하지 않습니다.");
      return;
    }

    axios
      .post("/api/subscribe", {
        subscription,
      })
      .catch((e) => console.error(e));
  }

  // Notification 허용 버튼 클릭 시
  async function onClickAlert() {
    if (
      "serviceWorker" in navigator &&
      "Notification" in window &&
      "PushManager" in window
    ) {      
        try {
            const result = await Notification.requestPermission();
            console.log("Clicked! onClickAlert--result: ", result);
            if (result === "granted") {
                //console.log("getPushSubscription: ");
                const subscription = await getPushSubscription();
                //console.log("onClickAlert--subscription: ", subscription);
                await savePushSubscription(subscription);
                setAlertGranted(true);
            } else if (result === "denied") {
                setAlertGranted(false);
                alert('Notifications permission has been blocked. Please reset it in the Page Info by clicking the tune icon next to the URL.');
            }
        } catch (error) {
            console.error("Error requesting notification permission: ", error);
        }
    }
  }

//   async function handleNotificationPermission() {
//   try {
//     const result = await Notification.requestPermission();
//     console.log("Clicked! onClickAlert--result: ", result);
//     if (result === "granted") {
//       const subscription = await getPushSubscription();
//       await savePushSubscription(subscription);
//       setAlertGranted(true);
//     } else if (result === "denied") {
//       setAlertGranted(false);
//       alert('Notifications permission has been blocked. Please reset it in the Page Info by clicking the tune icon next to the URL.');
//     }
//   } catch (error) {
//     console.error("Error requesting notification permission: ", error);
//   }
// }

  // 구독하고 있는 클라이언트들에게 Push 알림을 보내는 함수
  async function pushNotification() {
    console.log("pushNotification---clicked:");
    const subscriptions = await axios
      .get("/api/subscribe")
      .then((response) => response.data);

    //console.log("pushNotification---subscriptions: ", subscriptions);

    let promiseChain = Promise.resolve();

    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      promiseChain = promiseChain.then(() => {
        return triggerPushMsg(
          subscription,
          "🔔 TODO",
          "오늘의 할 일 잊지 마세요!",
        );
      });
    }

    return promiseChain;
  }

  async function triggerPushMsg(
    pushSubscription: SubscriptionInfo,
    title: string,
    message: string,
  ) {
    console.log("triggerPushMsg: ");
    await axios
      .post("/api/send-message", {
        pushSubscription: pushSubscription,
        title,
        message,
      })
      .catch((e) => console.error(e));
  }

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ ml: 1, mb: 3 }}
    >
      <Typography variant={"h5"} color={grey["800"]} sx={{ fontWeight: "800" }}>
        TODO
      </Typography>
      <div>
        <IconButton onClick={pushNotification}>
          <ForwardToInboxOutlinedIcon />
        </IconButton>
        <IconButton onClick={onClickAlert}>
          {alertGranted ? (
            <NotificationsNoneOutlinedIcon />
          ) : (
            <NotificationsOffOutlinedIcon />
          )}
        </IconButton>
      </div>
    </Stack>
  );
}

