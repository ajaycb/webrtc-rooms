const EventEmitter = require("events");

class ChatRoom extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.room.on("data_channel_recv_msg", (msg) => {
      msg.data = JSON.parse(msg.text);
      if (msg.data.type === "chat") {
        this.emit("receive", msg);
      }
    });
  }
  send(msg) {
    this.room.data_channel.send(
      JSON.stringify({
        type: "chat",
        msg,
      })
    );
  }
}
export default ChatRoom;
