import type { ServerMessage } from "./types";

const RECONNECT_DELAY = 500;
const RESPONSE_TIMEOUT = 5_000;

type TransportOptions = {
  onMessage: (message: ServerMessage) => void;
  onReconnect: () => void;
};

export function createTransport(options: TransportOptions) {
  const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/board-sync";
  url.search = "";
  url.hash = "";

  let socket: WebSocket;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let responseTimer: ReturnType<typeof setTimeout> | undefined;

  function closeSocket() {
    socket.onclose = null;
    socket.onmessage = null;
    socket.close();
  }

  function waitForResponse() {
    responseTimer = setTimeout(reconnect, RESPONSE_TIMEOUT);
  }

  function connect() {
    socket = new WebSocket(url);

    socket.onmessage = (event) => options.onMessage(JSON.parse(event.data) as ServerMessage);

    socket.onclose = reconnect;

    waitForResponse();
  }

  function reconnect() {
    options.onReconnect();

    clearTimeout(responseTimer);
    closeSocket();

    reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
  }

  function isOpen(): boolean {
    return socket?.readyState === WebSocket.OPEN;
  }

  function send(message: unknown): void {
    socket.send(JSON.stringify(message));
  }

  function clearResponseTimeout(): void {
    clearTimeout(responseTimer);
  }

  function dispose(): void {
    clearTimeout(reconnectTimer);
    clearTimeout(responseTimer);
    closeSocket();
  }

  return {
    connect,
    isOpen,
    send,
    waitForResponse,
    clearResponseTimeout,
    dispose,
  };
}
