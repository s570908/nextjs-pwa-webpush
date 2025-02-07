import { Checkbox, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ToDo, UpdateToDoInput } from "@/app/pwa-todo/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ChangeEvent } from "react";
import { updateToDoStatus } from "@/app/pwa-todo/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  todo: ToDo;
}

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ToDoCard({ todo }: Props) {

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newToDo: UpdateToDoInput) =>
      updateToDoStatus(newToDo.id, newToDo.done),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const onChangeDone = async (e: ChangeEvent<HTMLInputElement>) => {
    mutation.mutate({ id: todo.id, done: e.target.checked });
  };

  // 한국 시간대 설정
  //console.log("todo.due: ", todo.due);
  const localTime = dayjs(todo.due).local();
  //console.log("localTime: ", localTime);

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{
        borderRadius: 2,
        backgroundColor: "#fdebf3",
        borderLeft: "10px solid #fcdbe6",
        p: 1,
      }}
    >
      <Stack direction={"column"}>
        <Typography variant={"caption"} color={grey["600"]}>
          {localTime.format("A h:mm")}
        </Typography>
        <Typography variant={"body1"}>{todo.task}</Typography>
      </Stack>
      <Checkbox
        checked={todo.done}
        sx={{
          "&.Mui-checked": {
            color: "#eb8291",
          },
        }}
        onChange={onChangeDone}
      />
    </Stack>
  );
}
