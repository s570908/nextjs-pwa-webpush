self.addEventListener("activate", () => {
  console.log("service worker activated");
});

self.addEventListener("push", function (event) {
  console.log("Push event received: ", event);

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error("Error parsing push event data as JSON:", e);
    data = { title: "Default Title", message: event.data.text() };
  }

  const { title, message } = data;
  const options = {
    body: message,
    icon: "/app-icon/ios/192.png",
    //badge: '/badge.png'
  };
  console.log("self.addEventListener. push event: ", title, message, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

function periodicCheck() {
  const request = indexedDB.open("pwa-db");

  request.onerror = function (event) {
    console.error("IndexedDB를 열 수 없습니다.");
  };

  request.onsuccess = function (event) {
    const db = event.target.result;

    try {
      const transaction = db.transaction(["todo"], "readonly");
      const objectStore = transaction.objectStore("todo");
      const dueIndex = objectStore.index("due-index");

      const currentTime = new Date();
      const oneMinuteLater = new Date(currentTime.getTime() + 60 * 1000);

      const range = IDBKeyRange.bound(currentTime, oneMinuteLater);

      const cursorRequest = dueIndex.openCursor(range);

      console.log("range, cursorRequest: ", range, cursorRequest);

      cursorRequest.onsuccess = function (event) {
        
        const cursor = event.target.result;
        console.log("periodic check: cursorRequest.onsuccess--cursor", cursor);
        if (cursor) {
          const todo = cursor.value;          
          if (todo && todo.task) {
            console.log("periodic check: todo pushnotification done: ", todo);
            self.registration.showNotification("🔔 오늘의 할 일 잊지 마세요!", {
              body: todo.task,
              icon: "/app-icon/ios/192.png",
            });
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = function () {
        db.close();
      };
    } catch (e) {
      console.error("periodic check 에러 발생", e);
    }
  };
}

// 1분마다 알려야 할 알림이 있는지 체크
setInterval(periodicCheck, 60 * 1000);
