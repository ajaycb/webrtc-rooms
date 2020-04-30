import TextRoom from "./plugins/text_room";
import EventEmitter from "events";

const janusConfig = {
  janus: {
    keepAliveIntervalMs: 30000,
    options: {
      rejectUnauthorized: false,
    },
  },
};

class Room extends EventEmitter {
  constructor(user, room_id, Janus) {
    super();
    this.JanusKlass = Janus;
    this.user = user;
    this.room_id = room_id;
  }
  connect(cfg = {}) {
    let baseconfig = { ...janusConfig.janus, ...cfg };
    return this.setupConfig(baseconfig)
      .then((config) => {
        return this.janusInit(config);
      })
      .then(() => {
        this.text_room = new TextRoom(this);
        return this.text_room.setup();
      });
  }
  setupConfig(config) {
    return new Promise((resolve, reject) => {
      config.token =
        "1588420189,janus,janus.plugin.videoroom,janus.plugin.textroom,janus.plugin.audiobridge:Ka55MAmoofwP6H7W2xg9B1qF88Q=";
      resolve({ ...config });
    });
  }
  janusInit(config) {
    const Janus = this.JanusKlass;
    let room = this;
    return new Promise((resolve, reject) => {
      Janus.init({
        debug: "all",
        callback: function () {
          if (!Janus.isWebrtcSupported()) {
            console.log("No WebRTC support... ");
            return;
          }

          const janus = new Janus({
            server: config.url,
            token: config.token,
            success: () => {
              room.janus = janus;
              resolve(janus);
              room.emit("connected", room);
            },
            error: (error) => {
              reject();
            },
            destroyed: () => {
              room.emit("destoyed");
            },
          });
        },
      });
    });
  }
}
export default Room;
