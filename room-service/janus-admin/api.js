const axios = require("axios");

function genTxnId(len = 20) {
  let charSet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

const JANUS_ADMIN_SECRET = process.env.JANUS_ADMIN_SECRET;
class JanusAdmin {
  constructor(url) {
    this.url = url;
  }
  call(req) {
    let transaction = genTxnId();
    req.janus = "message_plugin";
    console.log("calling", this.url, req);
    req.admin_secret = JANUS_ADMIN_SECRET;
    req.transaction = transaction;
    req.request.admin_key = JANUS_ADMIN_SECRET;
    req.request.transaction = transaction;
    return axios.post(this.url, req).then((resp) => resp.data);
  }

  get textroom() {
    let ja = this;
    this._textroom = this._textroom || {
      call(request) {
        return ja.call({
          plugin: "janus.plugin.textroom",
          request,
        });
      },
      create(room, extras = {}) {
        return this.call({ request: "create", room, ...extras });
      },
      edit(room, extras) {
        return this.call({ request: "edit", room, ...extras });
      },
      exists(room) {
        return this.call({ request: "exists", room });
      },
      list() {
        return this.call({ request: "list" });
      },
      destroy(room, extras) {
        return this.call({ request: "destroy", room, ...extras });
      },
      listparticipants(room, extras) {
        return this.call({ request: "listparticipants", room, ...extras });
      },
      createIfNotExists(room, extras = {}) {
        return this.exists(room).then((result) => {
          if (result.response.exists) {
            return true;
          } else {
            return this.create(room, extras);
          }
        });
      },
    };
    return this._textroom;
  }

  get videoroom() {
    let ja = this;
    const videoroom_defaults = {
      publishers: 25,
      filterDirectCandidates: true,
      bitrate: 774144,
      firSeconds: 20,
    };

    this._videoroom = this._videoroom || {
      call(request) {
        return ja.call({
          plugin: "janus.plugin.videoroom",
          request,
        });
      },
      create(room, extras = {}) {
        extras = { ...videoroom_defaults, ...extras };
        return this.call({ request: "create", room, ...extras });
      },
      edit(room, extras) {
        return this.call({ request: "edit", room, ...extras });
      },
      exists(room) {
        return this.call({ request: "exists", room });
      },
      list() {
        return this.call({ request: "list" });
      },
      destroy(room, extras) {
        return this.call({ request: "destroy", room, ...extras });
      },
      listparticipants(room, extras) {
        return this.call({ request: "listparticipants", room, ...extras });
      },
      createIfNotExists(room, extras = {}) {
        return this.exists(room).then((result) => {
          if (result.response.exists) {
            return true;
          } else {
            return this.create(room, extras);
          }
        });
      },
    };
    return this._videoroom;
  }

  get audiobridge() {
    let ja = this;
    const audiobridge_defaults = {
      sampling_rate: 16000,
    };

    this._audiobridge = this._audiobridge || {
      call(request) {
        return ja.call({
          plugin: "janus.plugin.audiobridge",
          request,
        });
      },
      create(room, extras = {}) {
        extras = { ...audiobridge_defaults, ...extras };
        return this.call({ request: "create", room, ...extras });
      },
      edit(room, extras) {
        return this.call({ request: "edit", room, ...extras });
      },
      exists(room) {
        return this.call({ request: "exists", room });
      },
      list() {
        return this.call({ request: "list" });
      },
      destroy(room, extras) {
        return this.call({ request: "destroy", room, ...extras });
      },
      listparticipants(room, extras) {
        return this.call({ request: "listparticipants", room, ...extras });
      },
      createIfNotExists(room, extras = {}) {
        return this.exists(room).then((result) => {
          if (result.response.exists) {
            return true;
          } else {
            return this.create(room, extras);
          }
        });
      },
    };
    return this._audiobridge;
  }
}

const j = new JanusAdmin(process.env.JANUS_ADMIN_URL);

j.textroom.createIfNotExists(1).then(console.log);
module.exports = JanusAdmin;
