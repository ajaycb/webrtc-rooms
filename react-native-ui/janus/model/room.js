import Janus from '../janus';
import EventEmitter from 'events';

import DataChannel from './data_channel';
import AudioBridge from './audio_bridge';
import VideoPublisher from './publisher';
import VideoSubscriber from './subscriber';
import ChatRoom from './chatroom';
const janusConfig = {
  janus: {
    url: 'wss://janusws.jobsito.com',
    keepAliveIntervalMs: 30000,
    options: {
      rejectUnauthorized: false,
    },
    filterDirectCandidates: true,
    bitrate: 774144,
    firSeconds: 10,
    publishers: 20,
    token:
      '1588252448,janus,janus.plugin.videoroom,janus.plugin.textroom:YE3hb0qbAB3jtKDYZIYCLAZsb7o=',
  },
  peerConnectionConfig: {
    iceServers: [
      {url: 'stun:turnserver.techteamer.com:443'},
      {
        username: 'demo',
        url: 'turn:turnserver.techteamer.com:443?transport=udp',
        credential: 'secret',
      },
      {
        username: 'demo',
        url: 'turn:turnserver.techteamer.com:443?transport=tcp',
        credential: 'secret',
      },
    ],
  },
};

class Room extends EventEmitter {
  constructor(user, room_id) {
    super();
    this.user = user;
    this.room_id = room_id;
  }
  connect(cfg = {}) {
    let baseconfig = {...janusConfig.janus, ...cfg};
    return this.setupConfig(baseconfig)
      .then(config => {
        return this.janusInit(config);
      })
      .then(() => {
        this.data_channel = new DataChannel(this);
        return this.data_channel.setup();
      });
  }
  setupConfig(config) {
    return new Promise((resolve, reject) => {
      config.token =
        '1588420189,janus,janus.plugin.videoroom,janus.plugin.textroom,janus.plugin.audiobridge:Ka55MAmoofwP6H7W2xg9B1qF88Q=';
      resolve({...config});
    });
  }
  janusInit(config) {
    let room = this;
    return new Promise((resolve, reject) => {
      Janus.init({
        dependencies: false,
        debug: 'all',
        callback: function() {
          console.warn('creating janus');
          const janus = new Janus({
            server: config.url,
            token: config.token,
            success: () => {
              room.janus = janus;
              resolve(room.janus);
              room.emit('connected', room);
            },
            error: error => {
              console.error('Error', error);
              reject();
            },
            destroyed: () => {
              room.emit('destoyed');
            },
          });
        },
      });
    });
  }
  videoPublisher() {
    if (this.videoPublisher) return this.videoPublisher;
    this.videoPublisher = new VideoPublisher(this);
  }
  videoSubscriber() {
    if (this.videoSubscriber) return this.videoSubscriber;
    this.videoSubscriber = new VideoSubscriber(this);
  }
  audioBridge() {
    if (this.audioBridge) return this.audioBridge;
    this.audioBridge = new AudioBridge(this);
  }
  chatRoom() {
    if (this.chatRoom) return this.chatRoom;
    this.chatRoom = new ChatRoom(this);
  }
}
export default Room;
