import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { Message } from "../types/Chat";

const API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io";

interface UseSignalROptions {
  token: string | null;
  onReceiveMessage: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useSignalR({
  token,
  onReceiveMessage,
  onError,
}: UseSignalROptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onReceiveMessageRef = useRef(onReceiveMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReceiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!token) return;

    const hubUrl = `${API_BASE}/hub?access_token=${token}`;
    console.log("[SignalR] Connecting to:", hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hub?access_token=${token}`, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on("newmessage", (data) => {
      console.log("[SignalR] Received message:", data);
      onReceiveMessageRef.current?.(data);
    });

    connection
      .start()
      .then(() => {
        console.log("[SignalR] Connected successfully");
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("[SignalR] Connection error:", err);
        setIsConnected(false);
        onErrorRef.current?.(err);
      });

    connection.onreconnecting((err) => {
      console.log("[SignalR] Reconnecting...", err);
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log("[SignalR] Reconnected");
      setIsConnected(true);
    });

    connection.onclose((err) => {
      console.log("[SignalR] Connection closed", err);
      setIsConnected(false);
      if (err) {
        onErrorRef.current?.(err);
      }
    });

    return () => {
      connection.stop();
    };
  }, [token]);

  return { isConnected };
}
