import { FiCast } from "react-icons/fi";
import { useContext } from "react";
import { IoGameController } from "react-icons/io5";
import { TbCricket } from "react-icons/tb";
import './elements.css';
import { WebSocketContext } from "../context/WsContext";
function RoomPanel({ closeMenu }: { closeMenu: () => void }) {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("Websocket context is not provided!")
  }
  const { roomName, sendMessage, rcount } = context;
  const roomList = ["common", "Game", "Cricket"];
  const type_name = "room";

  return (
    <div className="room-container">
      <RoomCard icon={<IoGameController className="icon" />} name={roomList[1]} active={roomName === roomList[1] ? true : false} press={() => {
        sendMessage(type_name, undefined, roomList[1])
        closeMenu()
      }} rcount={rcount === null? 0 : rcount?.Game} />
      <RoomCard icon={<FiCast className="icon" />} name={roomList[0]} active={roomName === roomList[0] ? true : false} press={() => {
        sendMessage(type_name, undefined, roomList[0])
        closeMenu()
      }} rcount={rcount === null? 0 : rcount?.common} />
      <RoomCard icon={<TbCricket className="icon" />} name={roomList[2]} active={roomName === roomList[2]} press={() => {
        sendMessage(type_name, undefined, roomList[2])
        closeMenu()
      }} rcount={rcount === null? 0 : rcount?.Cricket} />

    </div>
  )
}

export default RoomPanel;

const RoomCard = ({ icon, name, active, press, rcount }: { icon: any, name: string, active: boolean, press: () => void, rcount: number }) => {
  return (
    <div className={active ? "card-container card-container-active" : "card-container"} onClick={press}>
      <p className={active ? "rcount rcount-active" : "rcount"} >{rcount}</p>
      <div className={active ? "icon-container icon-container-active" : "icon-container"}>
        {icon}
      </div>
      <div className="name-container">
        {name}
      </div>
    </div>
  )
}
