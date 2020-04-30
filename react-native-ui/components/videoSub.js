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

const VideoSubscriber = ({
  room,
  inputStream,
  onLoaded,
  remote_id,
  loading = <span>Loading</span>,
  config = {},
}) => {
  const [videoRoom, setVideoRoom] = useState({
    videoRoom: null,
    ready: false,
    subscriber: null,
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

      vr.createSubscriber(remote_id).then((subscriber) => {
        setVideoRoom({
          videoRoom: vr,
          ready: true,
          subscriber: subscriber,
        });
      });
    });
  }, []);

  if (!videoRoom.ready) {
    return loading;
  }
  return onLoaded(videoRoom);
};
export default VideoSubscriber;
