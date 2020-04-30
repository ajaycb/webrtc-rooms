import React, { useRef, useState, useEffect } from "react";
import JanusPlayer from "./JanusPlayer";
import { VideoPublisher } from "janus-api";

const VideoPublisherUI = ({
  room,
  secret,
  pin,
  videoPublisher,
  media = { video: "lowres" },
}) => {
  const [playerState, setPlayerState] = useState("Ready");
  const [isMuted, setIsMuted] = useState(false);
  let [_videoPublisher, setVideoPublisher] = useState(
    videoPublisher || new VideoPublisher(room)
  );
  const [feedId, setFeedId] = useState(null);

  const videoArea = useRef(null);

  useEffect(() => {
    let currentStream;
    console.warn("connect to videoPub");
    const joined = (data) => {
      setFeedId(data.id);
      setPlayerState("Paused");
    };
    const onlocalstream = (stream) => {
      currentStream = stream;
      if (videoArea.current) {
        try {
          console.log("sessing stream", stream, " to ", videoArea.current);
          videoArea.current.srcObject = stream;
        } catch (e) {
          videoArea.current.src = URL.createObjectURL(stream);
        }
        if (_videoPublisher.isLive()) setPlayerState("Live");

        let videoTracks = stream.getVideoTracks();
        if (
          videoTracks === null ||
          videoTracks === undefined ||
          videoTracks.length === 0
        ) {
          setPlayerState("Error");
        }
      }
    };
    const oncleanup = () => {
      setPlayerState("Paused");
      setIsMuted(false);
    };

    _videoPublisher.on("joined", joined);
    _videoPublisher.on("onlocalstream", onlocalstream);
    _videoPublisher.on("oncleanup", oncleanup);
    const cleanup = () => {
      _videoPublisher.removeListener("joined", joined);
      _videoPublisher.removeListener("onlocalstream", onlocalstream);
      _videoPublisher.removeListener("oncleanup", oncleanup);
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
    _videoPublisher
      .connect()
      .then(() => {
        setPlayerState("Paused");
      })
      .catch((err) => {
        console.error(err);
        setPlayerState("Error");
        setIsMuted(false);
      });
    return cleanup;
  }, [room, _videoPublisher]);

  const onStartClick = () => {
    _videoPublisher.publish(media);
  };

  const onStopClick = () => {
    // unpublishOwnFeed(sfutest);
    setPlayerState("Paused");
  };

  const onMuteClick = () => {
    if (!_videoPublisher.isAudioMuted()) {
      _videoPublisher.muteAudio();
    }
    setIsMuted(_videoPublisher.isAudioMuted());
  };

  const onUnMuteClick = () => {
    if (_videoPublisher.isAudioMuted()) {
      _videoPublisher.unmuteAudio();
    }
    setIsMuted(_videoPublisher.isAudioMuted());
  };

  const onBandwidthChange = (bitrate) => {
    _videoPublisher.changeBandwidth(bitrate);
  };
  const playerProps = {
    ref: videoArea,
    isPublisher: true,
    status: playerState,
    isMuted: isMuted,
    muted: true,
    onStart: onStartClick,
    onStop: onStopClick,
    onMute: onMuteClick,
    onUnmute: onUnMuteClick,
    onBandwidthChange: onBandwidthChange,
  };
  return (
    <div className="janus-video">
      ID:{feedId}
      <JanusPlayer
        style={{ border: "1px solid red", width: "320px", height: "240px" }}
        {...playerProps}
      />
    </div>
  );
};

export default VideoPublisherUI;
