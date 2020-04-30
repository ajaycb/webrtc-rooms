import React, { useRef, useState, useEffect } from "react";

import JanusPlayer from "./JanusPlayer";
import { VideoSubscriber } from "janus-api";

const VideoSubscriberUI = ({ room, feed, secret, pin }) => {
  const [playerState, setPlayerState] = useState("Ready");
  const [isMuted, setIsMuted] = useState(false);
  const [feedId, setFeedId] = useState(feed);
  const [debug, set_debug] = useState("");
  let [videoSubscriber, setVideoSubscriber] = useState(
    new VideoSubscriber(room)
  );

  const videoArea = useRef(null);
  let currentStream;
  useEffect(() => {
    const joined = () => {
      setPlayerState("Paused");
    };
    const onremotestream = (stream, param) => {
      console.warn("remote strm", param);
      if (videoArea.current && currentStream !== stream) {
        try {
          console.log("sessing stream", stream, " to ", videoArea.current);
          videoArea.current.srcObject = stream;
          currentStream = stream;
        } catch (e) {
          videoArea.current.src = URL.createObjectURL(stream);
          currentStream = stream;
        }
      }
      if (videoSubscriber.isLive()) {
        setPlayerState("Live");
      }

      var videoTracks = stream.getVideoTracks();
      set_debug(
        `Num tracks = ${videoTracks.length}. Link status ${videoSubscriber.plugin.webrtcStuff.pc.iceConnectionState}`
      );
      if (
        videoTracks === null ||
        videoTracks === undefined ||
        videoTracks.length === 0
      ) {
        setPlayerState("Error");
      }
    };
    const oncleanup = () => {
      setPlayerState("Paused");
      setIsMuted(false);
    };

    videoSubscriber.on("joined", joined);
    videoSubscriber.on("onremotestream", onremotestream);
    videoSubscriber.on("oncleanup", oncleanup);
    const cleanup = () => {
      videoSubscriber.removeListener("joined", joined);
      videoSubscriber.removeListener("onremotestream", onremotestream);
      videoSubscriber.removeListener("oncleanup", oncleanup);
    };
    return cleanup;
  }, [room]);

  const playerProps = {
    ref: videoArea,
    isPublisher: false,
    status: playerState,
    isMuted: isMuted,
  };
  return (
    <div className="janus-video">
      FeedID
      <input
        value={feedId}
        onChange={(e) => {
          setFeedId(e.target.value);
        }}
      />
      <button
        onClick={() =>
          videoSubscriber
            .connect(parseInt(feedId))
            .then(() => console.log("Connected"))
        }
      >
        Join {debug}
      </button>
      <JanusPlayer
        {...playerProps}
        style={{ border: "1px solid red", width: "640px", height: "480px" }}
      />
    </div>
  );
};

export default VideoSubscriberUI;
