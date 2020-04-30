import React, { useState, useEffect } from "react";
import ChatRoom from "../janus/model/chatroom";

const Chat = ({ room }) => {
  let [currentMessage, setCurrentMessage] = useState("");
  let [messages, setMessages] = useState([]);
  let [len, setLen] = useState(0);
  let [chatRoom, setChatroom] = useState(new ChatRoom(room));
  useEffect(() => {
    chatRoom.on("receive", (msg) => {
      console.log("got message", msg);
      messages.push(msg);
      setLen(messages.length);
      setMessages(messages);
    });
  }, []);
  return (
    <div className="janus-chat-container">
      <div className="janus-chat-history">
        {messages &&
          messages.map((message, idx) => (
            <div className="janus-chat-display" key={idx}>
              <span className="date">{message.date}</span>
              <span className="user">{message.from}:</span>
              <span className="message">{JSON.stringify(message.data)}</span>
            </div>
          ))}
      </div>
      <div className="janus-chat-control">
        <div className="janus-chat-message">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <button
            onClick={() => {
              currentMessage && chatRoom.send({ msg: currentMessage });
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
