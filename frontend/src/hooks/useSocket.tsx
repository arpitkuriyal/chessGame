import { useEffect, useState } from "react";

type ConnectionIntent = "game" | "history";

export default function useSocket(
  url: string,
  getSessionToken: () => Promise<string | null>,
  intent: ConnectionIntent
) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryCount = 0;
    let activeSocket: WebSocket | undefined;

    const scheduleReconnect = () => {
      if (stopped || retryTimer) return;
      const delay = Math.min(1000 * 2 ** retryCount, 10_000);
      retryCount += 1;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        void connect();
      }, delay);
    };

    const connect = async () => {
      let sessionToken: string | null;
      try {
        sessionToken = await getSessionToken();
      } catch {
        scheduleReconnect();
        return;
      }
      if (stopped) return;
      if (!sessionToken) {
        scheduleReconnect();
        return;
      }

      const ws = new WebSocket(url);
      activeSocket = ws;

      ws.onopen = () => {
        retryCount = 0;
        setSocket(ws);
        ws.send(JSON.stringify({ type: "authenticate", token: sessionToken, intent }));
      };

      ws.onclose = (event) => {
        setSocket((current) => current === ws ? null : current);
        if (activeSocket === ws) activeSocket = undefined;
        if (event.code !== 1008) scheduleReconnect();
      };

      ws.onerror = () => ws.close();
    };

    void connect();
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      activeSocket?.close();
      setSocket(null);
    };
  }, [getSessionToken, intent, url]);

  return socket;
}
