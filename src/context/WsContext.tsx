import { createContext, useEffect, useState } from "react";
import { wsUrl } from '../services/chat';
import type { singleMessage } from "../commons/chatModels";

interface WebSocketContextValues {
  ws: WebSocket | null;
  sendMessage: (message: string) => void;
  userName: string | null;
  allConnectUser: string[] | null;
  log: string | null;
  setUserLogin: (name: string) => void;
  setUserLogout: () => void;
  messages: singleMessage | null;
  reconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextValues | null>(null);
const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [log, setLog] = useState<string | null>(null);
  const [allConnectUser, setAllConnectUser] = useState<string[] | null>(null);
  const [messages, setMessages] = useState<singleMessage | null>(null);


  const fetchUserName = () => {
    const name = localStorage.getItem("userInfo");
    if (name) {
      setUserName(name);
      return true;
    } else {
      setUserName(null);
      return false;
    }
  };
  const setUserLogin = (name: string) => {
    localStorage.setItem("userInfo", name);
    setUserName(name);
    location.reload();
  }
  const reconnect = () => {
    console.log("inside the reconnect")
    if (ws === null) {
      console.log("call the reconnect fucntion")
      connectWebSocket();
    }
  }



  const setUserLogout = () => {
    if (ws) {
      ws?.close()
    }
    localStorage.removeItem("userInfo");
    setUserName(null);
  }

  // const maxRetryAttempts = 5;
  // const retryDelay = 5000;
  // const retryConnectWebSocket = (attempt = 0) => {
  //   connectWebSocket();

  //   setTimeout(() => {
  //     if (attempt < maxRetryAttempts && !ws) {
  //       retryConnectWebSocket(attempt + 1);
  //     }
  //     else if (attempt >= maxRetryAttempts) {
  //       setLog("[Error] Maximum retry attempts exceeded!");
  //     }
  //   }, retryDelay);
  // }

  const connectWebSocket = () => {
    if (ws) {
      console.log("[Warn] WebSocket Already Connected!");
      return;
    };
    const socket = new WebSocket(`${wsUrl}/ws/chat?userInfo=${userName}`);
    socket.onopen = () => {
      setWs(socket);
      console.log("[Success] WebSocket is open!");
    }
    socket.onmessage = (event: MessageEvent) => {
      console.log("[success] Message recieved from server!")
      const recievedData = JSON.parse(event.data);
      console.log("[Recieve Data from server]", recievedData);
      switch (recievedData?.type) {
        case "userList":
          console.log("[userList]", recievedData?.data);
          setAllConnectUser(recievedData?.data);
          break;
        case "messages":
          console.log("[Messages]", recievedData?.data);
          setMessages(recievedData?.data);
          break;
        default:
          console.log("[Defult] Type is missing here!", recievedData?.data);
      }
    }
    socket.onclose = () => {
      console.log("[Warn] Socket is closed!");
      setWs(null);
    }
    socket.onerror = (err: Event) => {
      console.log(`[Error] Socket produced error:${err}`);
    }
  };
  useEffect(() => {
    if (fetchUserName()) {
      // retryConnectWebSocket()
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };

  }, [userName]);
  const sendMessage = (message: string) => {
    if (!ws) {
      setLog("[Error] WebSocket is not connect yet!")
      return;
    }
    switch (ws.readyState) {
      case WebSocket.OPEN:
        setLog("[Success] WebSocket is ready for Communication!");
        break;
      case WebSocket.CONNECTING:
        setLog("[Warn] WebSocket is Connecting!");
        return;
      case WebSocket.CLOSING:
        setLog("[Warn] Websocket is clossing!");
        return;
      case WebSocket.CLOSED:
        setLog("[Error] Websocket Clossed!");
        return;
    };
    if (!userName) {
      setLog("[Error] UserName is not Set yet!");
      return;
    }

    let request = {
      "date": getPostgresDateString(),
      "sms": message,
      "userInfo": userName
    };
    ws.send(JSON.stringify(request));
  };


  return (
    <WebSocketContext.Provider value={{ ws, userName, setUserLogin, messages, log, allConnectUser, sendMessage, setUserLogout, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  )
};


export { WebSocketContext, WebSocketProvider }


function getPostgresDateString(date = new Date()) {
  const pad = (n: any) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
