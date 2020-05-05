function randomString(len, charSet) {
  charSet =
    charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

class TextRoom {
  constructor(room) {
    this.room = room;
  }

  send_txt(text) {
    var message = {
      textroom: "message",
      transaction: randomString(12),
      room: this.room.room_id,
      text: text,
      ack: false,
    };
    // Note: messages are always acknowledged by default. This means that you'll
    // always receive a confirmation back that the message has been received by the
    // server and forwarded to the recipients. If you do not want this to happen,
    // just add an ack:false property to the message above, and server won't send
    // you a response (meaning you just have to hope it succeeded).
    return new Promise((resolve, reject) => {
      this.plugin.data({
        text: JSON.stringify(message),
        error: reject,
        success: resolve,
      });
    });
  }
  whisper_txt(to, text) {
    var message = {
      textroom: "message",
      transaction: randomString(12),
      room: this.room.room_id,
      text: text,
      ack: true,
      to,
    };
    // Note: messages are always acknowledged by default. This means that you'll
    // always receive a confirmation back that the message has been received by the
    // server and forwarded to the recipients. If you do not want this to happen,
    // just add an ack:false property to the message above, and server won't send
    // you a response (meaning you just have to hope it succeeded).
    return new Promise((resolve, reject) => {
      this.plugin.data({
        text: JSON.stringify(message),
        error: reject,
        success: resolve,
      });
    });
  }

  send_to(type, to, payload) {
    return this.whisper_txt(
      "" + to,
      JSON.stringify({
        payload,
        type,
      })
    );
  }
  send(type, payload) {
    return this.send_txt(
      JSON.stringify({
        payload,
        type,
      })
    );
  }

  setup() {
    return new Promise((resolve, reject) => {
      this.room.janus.attach({
        plugin: "janus.plugin.textroom",
        opaqueId: "" + this.room.user.id,
        success: (pluginHandle) => {
          this.plugin = pluginHandle;
          var body = { request: "setup" };
          this.plugin.send({ message: body });
        },
        error: function (error) {
          reject();
          console.error("  -- Error attaching plugin...", error);
        },
        webrtcState: function (on) {
          console.log(
            "Janus says our WebRTC PeerConnection is " +
              (on ? "up" : "down") +
              " now"
          );
        },
        onmessage: (msg, jsep) => {
          console.debug(" ::: Got a message :::");
          console.debug(msg);
          if (msg["error"] !== undefined && msg["error"] !== null) {
            //todo error
          }
          if (jsep !== undefined && jsep !== null) {
            // Answer
            this.plugin.createAnswer({
              jsep: jsep,
              media: { audio: false, video: false, data: true }, // We only use datachannels
              success: (jsep) => {
                console.debug("Got SDP!");
                console.debug(jsep);
                var request = { request: "ack" };
                this.plugin.send({ message: request, jsep: jsep });
              },
              error: function (error) {
                console.error("WebRTC error:", error);
              },
            });
          }
        },
        ondataopen: (data) => {
          console.debug("The DataChannel is available!");
          const request = {
            request: "create",
            room: this.room.room_id,
          };
          this.plugin.send({
            message: request,
            success: (data) => {
              console.debug("Textroom created", data);
              if (data.error_code === 418) {
                //then its ok
              }
              this.room.emit("data_channel_created");

              const request = {
                textroom: "join",
                transaction: randomString(12),
                room: this.room.room_id,
                username: "" + this.room.user.id,
                display: this.room.user.name,
              };
              console.log("joinign room", request);
              this.plugin.data({
                text: JSON.stringify(request),
                success: (data) => {
                  resolve();
                  this.room.emit("data_channel_ready", data);
                },
              });
            },
          });
        },
        ondata: (data) => {
          const json = JSON.parse(data);
          console.warn("We got data from the DataChannel! ", json);

          const event = json.textroom;

          if (event === "success") {
            if (json.participants) {
              json.participants.forEach((p) =>
                this.room.addParticipant({
                  id: p.username,
                  name: p.display,
                })
              );
            }
          } else if (event === "message") {
            let data = JSON.parse(json["text"]);
            const msg = {
              from: json["from"],
              date: json["date"],
              ...data,
            };
            if (msg.type) {
              this.room.emit(`${msg.type}_data_received`, msg);
            }
            this.room.emit("data_channel_recv_msg", msg);
          } else if (event === "join") {
            this.room.addParticipant({
              id: json.username,
              name: json.display,
            });
          } else if (event === "leave") {
            this.room.removeParticipant(json.username);
          }

          // } else if (event === "announcement") {

          //
          // } else if (event === "kicked") {
          // } else if (event === "destroyed") {
          // }
          this.room.emit("data_channel_recv", json);
        },
        oncleanup: function () {
          console.log(" ::: Got a cleanup notification :::");
        },
      });
    });
  }
}
export default TextRoom;
