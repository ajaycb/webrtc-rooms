import React, { useRef, useState, useEffect } from "react";

import Janus from "../janus-utils/janus";
import { publishToRoom } from "../janus-utils/publisher";
import { subscribeRemoteFeed } from "../janus-utils/subscriber";
import JanusPlayer from "./JanusPlayer";

const JanusSubscriber = ({ secret, room, children }) => {
  const videoArea = useRef(null);
  const [playerState, setPlayerState] = useState("Ready");
  const [sfutest, setSfuTest] = useState(null);
  const [remoteFeed, setRemoteFeed] = useState(null);

  let mystream = null;

  const remoteFeedCallback = (_remoteFeed, eventType, data) => {
    setRemoteFeed(_remoteFeed);
    if (eventType === "onremotestream") {
      if (mystream === data) return;
      mystream = data;
      const videoContainer = videoArea.current;
      const videoPlayer = videoContainer.querySelector(".janus-video-player");

      Janus.attachMediaStream(videoPlayer, mystream);
      if (
        _remoteFeed.webrtcStuff.pc.iceConnectionState !== "completed" &&
        _remoteFeed.webrtcStuff.pc.iceConnectionState !== "connected"
      ) {
        setPlayerState("Live");
      }
      var videoTracks = mystream.getVideoTracks();
      if (
        videoTracks === null ||
        videoTracks === undefined ||
        videoTracks.length === 0
      ) {
        setPlayerState("Error");
      }
    } else if (eventType === "oncleanup") {
      setPlayerState("Paused");
    } else if (eventType === "error") {
      setPlayerState("Error");
    }
  };

  useEffect(() => {
    if (!room) {
      return;
    }
    publishToRoom(
      room.janus,
      room.user.id,
      room.roomId,
      secret,
      undefined,
      room.user.name,
      false,
      (_sfutest, eventType, data) => {
        setSfuTest(_sfutest);

        if (eventType === "joined") {
          if (data.publishers !== undefined && data.publishers !== null) {
            // we are only consiering one publisher now
            const list = data.publishers;
            if (list.length == 0) {
              return;
            }

            const publisher = list[0];
            const { id, display, audio_codec, video_codec } = publisher;
            subscribeRemoteFeed(
              room.janus,
              room.user.id,
              room.roomId,
              id,
              null,
              room.user.name,
              audio_codec,
              video_codec,
              remoteFeedCallback
            );
          }
        } else if (eventType === "publishers") {
          if (data.publishers !== undefined && data.publishers !== null) {
            // we are only consiering one publisher now
            const list = data.publishers;
            if (list.length === 0) {
              return;
            }

            const publisher = list[0];
            const { id, display, audio_codec, video_codec } = publisher;
            subscribeRemoteFeed(
              room.janus,
              room.user.id,
              room.roomId,
              id,
              null,
              room.user.name,
              audio_codec,
              video_codec,
              remoteFeedCallback
            );
          }
        } else if (eventType === "leaving" || eventType === "unpublished") {
          if (remoteFeed !== null) {
            remoteFeed.detach();
          }
        }
      }
    );
  }, [room]);

  const playerElement = children ? children : <JanusPlayer />;

  return (
    <div className="janus-subscriber">
      <div className="janus-video">
        {React.cloneElement(playerElement, {
          ref: videoArea,
          isPublisher: false,
          status: playerState,
        })}

        {/* <JanusPlayer 
                    ref={videoArea}
                    isPublisher={false}
                    status={playerState}
                /> */}
      </div>
    </div>
  );
};

export default JanusSubscriber;
