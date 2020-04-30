import React, { useEffect, useState } from "react";
import { VideoRoom } from "./janus-api/index";

const defaultConfig = {
  codec: "vp8,vp9,h264",
  record: false,
  videoOrientExt: false,
  bitrate: 774144,
  firSeconds: 10,
  publishers: 20,
  notify_joining: true,
};

const VideoPublisher = ({
  room,
  inputStream,
  onLoaded,
  loading = <span>Loading</span>,
  config = {},
}) => {
  const [videoRoom, setVideoRoom] = useState({
    videoRoom: null,
    ready: false,
    publisher: null,
  });
  useEffect(() => {
    let roomConfig = {
      ...defaultConfig,
      ...config,
      id: room.roomId,
      user: room.user,
    };
    const vr = new VideoRoom(room.user, roomConfig);

    room.janus.addPlugin(vr).then((plugin) => {
      console.log("VideoRoomPublisherJanusPlugin added", plugin);

      vr.connect().then((publisher) => {
        publisher
          .publish(inputStream, room.config.peerConnectionConfig)
          .then(() => {
            setVideoRoom({ videoRoom: vr, readt: true, publisher });
          });
      });
    });
  }, []);

  if (!videoRoom.ready) {
    return loading;
  }
  return onLoaded(videoRoom);
};
export default VideoPublisher;
