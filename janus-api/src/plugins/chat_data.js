const EventEmitter = require("events");

// class Message {
//   id;
//   timetamp;
//   type;
//   text;
//   payload;
//   user;
// }

class ChatData extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.messages = [];
    this.room.on("chat_data_received", (msg) => {
      this.emit("receive", msg);
    });
  }

  send(message) {
    this.room.text_room.send("chat", message);
  }
}
export default ChatData;
