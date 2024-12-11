import { useState, useEffect } from "react";

export default function useSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create the WebSocket instance
    const ws = new WebSocket(url);

    // Handle WebSocket events
    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Cleanup function to close WebSocket and clear listeners
    return () => {
      console.log("Cleaning up WebSocket...");
      ws.close();
    };
  }, []); // Dependency array ensures the effect runs only when the URL changes

  return socket;
}
