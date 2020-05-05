import EventEmitter from "events";

class VideoPublisher extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.participants = {};
  }
  isLive() {
    return (
      this.plugin &&
      this.plugin.webrtcStuff.pc.iceConnectionState !== "completed" &&
      this.plugin.webrtcStuff.pc.iceConnectionState !== "connected"
    );
  }
  isAudioMuted() {
    return this.plugin.isAudioMuted();
  }
  muteAudio() {
    return this.plugin.muteAudio();
  }
  unmuteAudio() {
    return this.plugin.unmuteAudio();
  }
  changeBandwidth(bitrate) {
    return new Promise((success, error) => {
      this.plugin.send({
        message: { request: "configure", bitrate: bitrate },
        success,
        error,
      });
    });
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.room.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: "" + this.room.user.id,
        success: (pluginHandle) => {
          this.plugin = pluginHandle;

          const create = {
            request: "create",
            notify_joining: true,
            room: this.room.room_id,
            secret: this.secret,
            pin: this.pin,
            filterDirectCandidates: true,
            bitrate: 774144,
            firSeconds: 10,
            publishers: 20,
          };
          // send message to create new room
          this.plugin.send({
            message: create,
            success: (data) => {
              // check if room create is okay
              if (
                (data.videoroom && data.videoroom === "created") ||
                data.error_code === 427
              ) {
                // now register ourselves

                var register = {
                  request: "join",
                  room: this.room.room_id,
                  ptype: "publisher",
                  display: this.room.user.name,
                };

                this.plugin.send({
                  message: register,
                  success: resolve,
                });
              }
            },
            error: (error) => {
              console.error("Error creating room ", error);
              reject();
            },
          });
        },
        consentDialog: (on) => {},
        mediaState: (medium, on) => {
          this.emit("mediaState", medium, on);
        },
        webrtcState: (on) => {
          this.emit("webrtcState", on);
        },
        onmessage: (msg, jsep) => {
          this.emit("onmessage", msg, jsep);

          const event = msg.videoroom;
          if (msg.publishers) {
            this.participants = msg.publishers.reduce((ret, val) => {
              ret[val.id] = val;
              return ret;
            }, {});
          }

          if (event) {
            if (event === "joined") {
              this.emit(event, msg, jsep);
            } else if (event === "destroyed") {
              this.emit(event, msg, jsep);
            } else if (event === "event") {
              if (msg.error) this.emit("error", msg, jsep);
              if (msg.publishers) {
                this.emit("publishers", msg, jsep);
              }
              if (msg.leaving) this.emit("leaving", msg, jsep);
              if (msg.unpublished) {
                delete this.participants[msg.unpublished];
                this.emit("unpublished", msg, jsep);
              }
            }
          }

          if (jsep !== undefined && jsep !== null) {
            this.plugin.handleRemoteJsep({ jsep: jsep });
            // Check if any of the media we wanted to publish has
            // been rejected (e.g., wrong or unsupported codec)

            if (this.local_stream) {
              if (
                this.local_stream.getAudioTracks() &&
                this.local_stream.getAudioTracks().length > 0 &&
                !msg.audio_codec
              ) {
                // Audio has been rejected
                console.error(
                  "Our audio stream has been rejected, viewers won't hear us"
                );
              }

              if (
                this.local_stream.getVideoTracks() &&
                this.local_stream.getVideoTracks().length > 0 &&
                !msg.video_codec
              ) {
                console.error(
                  "Our video stream has been rejected, viewers won't see us"
                );
              }
            }
          }
        },

        onlocalstream: (stream) => {
          this.local_stream = stream;
          this.emit("onlocalstream", stream);
        },
        oncleanup: () => {
          this.emit("oncleanup");
        },
      });
    });
  }

  publish(media = {}) {
    return new Promise((resolve, reject) => {
      media = {
        audioRecv: false,
        videoRecv: false,
        audioSend: true,
        videoSend: true,
        ...media,
      };
      this.plugin.createOffer({
        media,
        simulcast: false,
        success: (jsep) => {
          var publish = {
            request: "configure",
            audio: media.audioSend,
            video: media.videoSend,
          };
          this.plugin.send({
            message: publish,
            jsep: jsep,
            success: resolve,
            error: reject,
          });
        },
        error: reject,
      });
    });
  }
}
export default VideoPublisher;
