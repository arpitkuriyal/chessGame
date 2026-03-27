import { useEffect, useState } from "react";

export default function useSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("Disconnected");
      setSocket(null);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return socket;
}