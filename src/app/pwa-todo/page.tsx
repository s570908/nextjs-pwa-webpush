"use client";
import { grey } from "@mui/material/colors";
import { Container } from "@mui/system";
import ToDoBox from "@/app/pwa-todo/components/ToDoBox";
import { getAllToDo } from "@/app/pwa-todo/action";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubscriptionInfo, ToDo } from "@/app/pwa-todo/types";
import NavigationBar from "@/app/pwa-todo/components/NavigationBar";
import Header from "@/app/pwa-todo/components/Header";
import axios from "axios";
import { Button } from "@mui/material";

export default function PwaToDoPage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope,
          );
        })
        .catch((err) =>
          console.error("Service Worker registration failed: ", err),
        );
    }
  }, []);

  const { data: toDos } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getAllToDo(),
  });

  useEffect(() => {
    saveDB();
  }, [toDos]);

  function saveDB() {
    const dbName = "pwa-db";
    const request = indexedDB.open(dbName);

    // 데이터베이스가 처음 생성되거나 버전이 변경될 때 발생합니다. 
    // 이 이벤트 핸들러에서 데이터베이스 객체를 가져옵니다.
    request.onupgradeneeded = function (event) {
      // @ts-ignore
      const db = event.target.result;

      // 객체 저장소 (Object Store) 생성
      const objectStore = db.createObjectStore("todo", {
        keyPath: "id",
        autoIncrement: true,
      });

      objectStore.createIndex("due-index", "due_date");

      //객체 저장소가 생성된 후 트랜잭션이 완료되면 실행되는 이벤트 핸들러입니다. 
      // 여기서는 추가 작업을 수행하지 않습니다.
      objectStore.transaction.oncomplete = function (_event: Event) {
        // Store values in the newly created objectStore.
        var customerObjectStore = db
          .transaction("todo", "readwrite")
          .objectStore("todo");
      };
    };

    // 데이터베이스가 성공적으로 열릴 때 발생합니다. 이 이벤트 핸들러에서 데이터베이스 객체를 가져오고, 
    // "todo" 객체 저장소에 대한 읽기/쓰기 트랜잭션을 시작합니다.
    request.onsuccess = function (event) {
      // @ts-ignore
      const db = event.target.result;
      const transaction = db.transaction(["todo"], "readwrite");
      const objectStore = transaction.objectStore("todo");

      toDos?.forEach((todo: ToDo) => {
        objectStore.put({
          ...todo,
          due_date: new Date(todo.due),
        });
      });
    };
  }

  return (
    <Container
      maxWidth={"sm"}
      sx={{ backgroundColor: grey["100"], height: "100vh", pt: 4 }}
    >
      <Header />
      {toDos && <ToDoBox toDos={toDos} />}
      <NavigationBar />
    </Container>
  );
}
