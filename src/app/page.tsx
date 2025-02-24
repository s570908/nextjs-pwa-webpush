"use client";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
    const [isMount, setMount] = useState(false)

    useEffect(() => {
        setMount(true)
    }, [])
    
    const onClickVibrate = () => {
        navigator.vibrate(200);
    };

    if (!isMount) {
        return null
    }

  return (
    <>
      <Button onClick={onClickVibrate}>Click!</Button>
    </>
  );
}
