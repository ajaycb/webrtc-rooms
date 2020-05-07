const JanusAdmin = require("../janus-admin/api");
const Redis = require("redis");

class Persistence {
  constructor(room_model) {
    this.room_model = room_model;
    this.redis = Redis.createClient({ host: "redis" });
  }
}
class DataTrack {
  constructor({ code, display, type }) {
    Object.assign(this, { code, display, type });
  }
}
class RoomModel {
  constructor(janus = null) {
    this.janus = janus || new JanusAdmin(process.env.JANUS_ADMIN_URL);
    this.db = new Persistence(this);
  }

  define(roomId, participantCount, plugins, dataTracks) {}

  setup(room, plugins) {
    const { videoroom, textroom, audiobridge } = plugins;
    const ret_promises = [];
    const roomId = parseInt(req.params.room);

    if (videoroom) {
      ret_promises.push(
        janus_admin.videoroom.createIfNotExists(roomId, videoroom)
      );
    }
    if (textroom) {
      ret_promises.push(
        janus_admin.textroom.createIfNotExists(roomId, textroom)
      );
    }
    if (audiobridge) {
      ret_promises.push(
        janus_admin.audiobridge.createIfNotExists(roomId, audiobridge)
      );
    }
    return Promise.all(ret_promises).then((plugins) => true);
  }
}
