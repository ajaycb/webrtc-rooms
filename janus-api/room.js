import TextRoom from "./plugins/text_room";
import EventEmitter from "events";

const defaultConfig = {
  janus: {
    keepAliveIntervalMs: 30000,
    options: {
      rejectUnauthorized: false,
    },
  },
};
class Feed {
  constructor(room, user, type, identifier, extras = null) {
    Object.assign(this, { room, user, type, identifier });
    this.key = Feed.makeKey(user.id, type, identifier);
    this.data_provider = null;
    this.extras = extras;
    this.is_local = user.id === room.user.id;
    this.feed_type = room.feed_types.get(type);
    this.is_live = false;

    if (this.feed_type) {
      this.feed_type = this.is_local
        ? this.feed_type.local
        : this.feed_type.remote;

      let data_provider_klass = this.feed_type.data_provider;
      this.data_provider = new data_provider_klass(room);
    }
  }

  inited() {
    return this.data_provider !== null;
  }
  init(data_provider) {
    this.data_provider = data_provider;
  }
  notify(to = null) {
    if (!this.is_live) return;
    let payload = {
      user: this.user,
      type: this.type,
      identifier: this.identifier,
      extras: this.extras,
    };

    if (to) {
      this.room.text_room.send_to("feed", to, payload);
    } else {
      this.room.text_room.send("feed", payload);
    }
  }
  makeLive() {
    this.is_live = true;
    this.notify();
    return this;
  }

  close() {
    if (this.data_provider && this.data_provider.close) {
      this.data_provider.close();
    }
  }
  static makeKey(user_id, type, identifier) {
    return `${user_id}-${type}-${identifier}`;
  }
}

class FeedTypes {
  constructor() {
    this.types = {};
  }

  register({ type, local, remote }) {
    if (!local.component) throw "local component missing ";
    if (!local.data_provider) throw "local data_provider missing ";
    if (!remote.component) throw "remote component missing ";
    if (!remote.data_provider) throw "remote data_provider missing ";

    this.types[type] = {
      local,
      remote,
    };
    return this;
  }
  get(type) {
    return this.types[type];
  }
}
class Room extends EventEmitter {
  constructor(user, room_id, Janus, feed_types = null) {
    super();
    if (!Janus) throw "Janus is required";
    this.JanusKlass = Janus;
    this.user = user;
    this.room_id = room_id;
    this.feed_types = feed_types || new FeedTypes();

    this.participants = {};
    this.on("feed_data_received", ({ from, payload }) => {
      if (from !== "" + user.id) {
        console.warn(
          "update feeed",
          from,
          payload,
          user.id,
          "" + user.id === from
        );
        this.addRemoteFeed(
          payload.user,
          payload.type,
          payload.identifier,
          payload.extras
        );
      }
    });
  }

  addParticipant(user) {
    if (!user) throw "no user";
    this.participants[user.id] = this.participants[user.id] || { user };
    this.participants[user.id].feeds = this.participants[user.id].feeds || {};
    this.emit("participants_changed");
    return this.participants[user.id];
  }
  sendParticipantMyLocalFeeds(user) {
    this.myFeeds().forEach((feed) => {
      feed.notify(user);
    });
  }
  addRemoteFeed(user, type, identifier, extras) {
    let participant = this.addParticipant(user);
    let new_feed = new Feed(this, participant.user, type, identifier, extras);

    participant.feeds[new_feed.key] =
      participant.feeds[new_feed.key] || new_feed;
    this.emit("participants_changed");
    return participant.feeds[new_feed.key];
  }

  removeParticipant(user_id) {
    if (this.participants[user_id]) {
      let feeds = this.participants[user_id].feeds;
      Object.values(feeds).forEach((feed) => {
        feed.close();
      });
      delete this.participants[user_id];
      this.emit("participants_changed");
      this.emit("participants_deleted", user_id);
    }
  }

  getFeed(user_id, type, identifier) {
    if (this.participants[user_id]) {
      let feed_key = Feed.makeKey(user_id, type, identifier);
      return this.participants[user_id].feeds[feed_key];
    }
  }

  myFeeds() {
    this.addParticipant(this.user);
    let my = this.participants[this.user.id];
    return Object.values(my.feeds);
  }
  findOrCreateMyFeed(type, identifier) {
    this.addParticipant(this.user);
    let feed_key = Feed.makeKey(this.user.id, type, identifier);
    let my = this.participants[this.user.id];

    my.feeds[feed_key] =
      my.feeds[feed_key] || new Feed(this, this.user, type, identifier);
    let feed = my.feeds[feed_key];

    console.log("Local Feed", feed);
    return feed;
  }

  connect(config) {
    return this.janusInit(config).then(() => {
      this.text_room = new TextRoom(this);
      return this.text_room.setup();
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
export { Feed, FeedTypes };
