import Janus from '../janus';
const EventEmitter = require('events');

class AudioBridge extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
  }
  isLive() {
    return (
      this.plugin &&
      this.plugin.webrtcStuff.pc.iceConnectionState !== 'completed' &&
      this.plugin.webrtcStuff.pc.iceConnectionState !== 'connected'
    );
  }
  isAudioMuted() {
    return this.plugin.isAudioMuted();
  }
  muteAudio() {
    return new Promise((success, error) => {
      this.plugin.send({
        message: {request: 'configure', muted: true},
        success,
        error,
      });
    });
  }
  unmuteAudio() {
    return new Promise((success, error) => {
      this.plugin.send({
        message: {request: 'configure', muted: false},
        success,
        error,
      });
    });
  }
  changeBandwidth(bitrate) {
    return new Promise((success, error) => {
      this.plugin.send({
        message: {request: 'configure', bitrate: bitrate},
        success,
        error,
      });
    });
  }
  connect(join_opts = {}) {
    return new Promise((resolve, reject) => {
      this.room.janus.attach({
        plugin: 'janus.plugin.audiobridge',
        opaqueId: '' + this.room.user.id,
        success: pluginHandle => {
          this.plugin = pluginHandle;

          const create = {
            request: 'create',
            notify_joining: true,
            room: this.room.room_id,
            secret: this.secret,
            sampling_rate: 16000,
            sampling: 16000,
            pin: this.pin,
          };
          // send message to create new room
          this.plugin.send({
            message: create,
            success: data => {
              Janus.log('created room', data);
              // check if room create is okay
              if (
                data.audiobridge &&
                (data.audiobridge === 'created' || data.error_code === 486)
              ) {
                // now register ourselves

                var register = {
                  request: 'join',
                  room: this.room.room_id,
                  id: this.room.user.id,
                  display: this.room.user.name,
                  pin: this.pin,
                  muted: true,
                  ...join_opts,
                };
                this.plugin.send({
                  message: register,
                  success: resolve,
                });
              }
            },
            error: reject,
          });
        },
        error: reject,
        consentDialog: on => {},
        mediaState: (medium, on) => {
          this.emit('mediaState', medium, on);
        },
        webrtcState: on => {
          this.emit('webrtcState', on);
        },
        onmessage: (msg, jsep) => {
          Janus.log('Got message', msg);
          this.emit('onmessage', msg, jsep);

          const event = msg.audiobridge;
          if (event) {
            if (event === 'joined') {
              this.plugin.createOffer({
                media: {
                  video: false,
                  audio: true,
                  audioSend: true,
                  captureDesktopAudio: {echoCancellation: true},
                }, // This is an audio only room
                success: jsep => {
                  Janus.debug('Got SDP!');
                  Janus.debug(jsep);
                  var publish = {request: 'configure', muted: true};
                  this.plugin.send({
                    message: publish,
                    jsep: jsep,
                    success: () => {
                      this.emit('joined', msg, jsep);
                    },
                  });
                },
                error: error => {
                  Janus.error('WebRTC error:', error);
                },
              });
            } else if (event === 'destroyed') {
              this.emit(event, msg, jsep);
            } else if (event === 'event') {
              if (msg.error !== undefined && msg.error !== null) {
                this.emit('handle_error', msg);
              } else if (
                msg.publishers !== undefined &&
                msg.publishers !== null
              ) {
                this.emit('publishers', msg, jsep);
              } else if (
                msg['leaving'] !== undefined &&
                msg['leaving'] !== null
              ) {
                this.emit('leaving', msg, jsep);
              } else if (
                msg['unpublished'] !== undefined &&
                msg['unpublished'] !== null
              ) {
                this.emit('unpublished', msg, jsep);
              }
            }
          }

          if (jsep !== undefined && jsep !== null) {
            Janus.debug('Handling SDP as well...');
            Janus.debug(jsep);
            this.plugin.handleRemoteJsep({jsep: jsep});
          }
        },

        onlocalstream: stream => {
          console.log(' ::: Got a local stream :::');
          this.emit('onlocalstream', stream);
        },
        onremotestream: stream => {
          console.log(' ::: Got remote stream :::');
          this.remote_stream = stream;
          this.emit('onremotestream', stream);
        },
        oncleanup: () => {
          this.emit('oncleanup');
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
        videoSend: false,
        video: false,
        ...media,
      };

      this.plugin.createOffer({
        media, // This is an audio only room
        simulcast: false,
        success: jsep => {
          Janus.debug(jsep);
          var publish = {request: 'configure', muted: false};

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
export default AudioBridge;
