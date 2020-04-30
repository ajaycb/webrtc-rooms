import React, { useEffect, useState } from "react";
import Room from "janus-api";
import { Janus } from "janus-api";

const RoomContainer = ({
  config = { url: "wss://localhost:8188" },
  loading = <span>Loading..</span>,
  roomId,
  user,
  Child,
}) => {
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let myroom = new Room(user, roomId, Janus);
    console.warn("My Room", myroom, room, status);
    myroom
      .connect(config)
      .then(() => {
        myroom.on("hangup", () => setStatus("hangup"));
        setRoom(myroom);
      })
      .catch(() => setStatus("error"));
  }, [roomId]);

  if (room) return <Child room={room} />;
  if (status === "loading") return loading;
  if (status === "error") return <span>Error</span>;
  if (status === "hangup") return <span>Hungup</span>;
};
export default RoomContainer;
