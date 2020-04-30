import { userInfo } from "os";

const EventEmitter = require("events");

class WhiteboardData extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.room.on("board_data_received", ({ from, payload }) => {
      if (from !== "" + room.user.id) {
        this.emit("receive", payload);
      }
    });
  }
  send(board) {
    this.room.text_room.send("board", board);
  }
}

export default WhiteboardData;
