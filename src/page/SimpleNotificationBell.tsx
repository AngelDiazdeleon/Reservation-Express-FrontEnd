import React, { useState, useEffect, useRef } from "react";

const WebSocketTest: React.FC = () => {
  // 👇 Declaramos correctamente el tipo del WebSocket o null
  const ws = useRef<WebSocket | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {

    // 1. Abrir conexión
    ws.current = new WebSocket("ws://localhost:4000");

    // 2. onopen
    ws.current.onopen = () => {
      console.log("WS conectado");

      const token = localStorage.getItem("token");

      if (token && ws.current) {
        const payload = {
          type: "authenticate",
          token,
        };

        ws.current.send(JSON.stringify(payload));
      }
    };

    // 3. onmessage
    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WS mensaje:", msg);

        if (msg.type === "notification") {
          setCount((prev) => prev + 1);
          alert(`🔔 Nueva notificación: ${msg.data?.message}`);
        }
      } catch (err) {
        console.error("Error procesando mensaje:", err);
      }
    };

    // 4. onerror
    ws.current.onerror = (error: Event) => {
      console.error("WS error:", error);
    };

    // 5. onclose
    ws.current.onclose = () => {
      console.log("WS desconectado");
    };

    // 6. cleanup
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>WebSocket Test</h2>
      <p>Notificaciones recibidas: {count}</p>
    </div>
  );
};

export default WebSocketTest;
