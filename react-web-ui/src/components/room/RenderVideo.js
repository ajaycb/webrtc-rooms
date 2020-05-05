import React, { useRef, useState, useEffect } from "react";

function attachStream(ref, stream) {
  if (ref.current && stream) {
    try {
      ref.current.srcObject = stream;
    } catch (e) {
      ref.current.src = URL.createObjectURL(stream);
    }
  }
}
const RenderVideoPublisher = ({
  room,
  media = { video: "lowres" },
  render,
}) => {
  const [playerState, setPlayerState] = useState("not_ready");
  const [isMuted, setIsMuted] = useState(false);
  let [myFeed] = useState(room.findOrCreateMyFeed("videoroom", "webcam"));
  const _videoPublisher = myFeed.data_provider;
  const [feedId, setFeedId] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    let currentStream;
    const joined = (data) => {
      myFeed.extras = { remote_id: data.id };
      setFeedId(data.id);

      setPlayerState("ready");
    };
    const onlocalstream = (stream) => {
      currentStream = stream;
      myFeed.makeLive();
      attachStream(videoRef, stream);
      if (_videoPublisher.isLive()) setPlayerState("live");
    };
    const oncleanup = () => {
      setPlayerState("closed");
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
        _videoPublisher.publish(media);
        setPlayerState("ready");
      })
      .catch((err) => {
        console.error(err);
        setPlayerState("error");
        setIsMuted(false);
      });
    return cleanup;
  }, [room, _videoPublisher]);

  return render({
    videoPublisher: _videoPublisher,
    status: playerState,
    videoRef,
  });
};

const RenderVideoSubscriber = ({ room, feed, render }) => {
  const [playerState, setPlayerState] = useState("not_ready");
  let [videoSubscriber] = useState(feed.data_provider);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef(null);
  useEffect(() => {
    const joined = () => {
      setPlayerState("ready");
    };
    const onremotestream = (stream, param) => {
      attachStream(videoRef, stream);
      console.warn("remote strm", param);

      if (videoSubscriber.isLive()) {
        setPlayerState("live");
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

    videoSubscriber
      .connect(parseInt(feed.extras.remote_id))
      .then(() => console.log("Connected"));

    return cleanup;
  }, [room]);

  return render({
    videoSubscriber,
    status: playerState,
    videoRef,
  });
};

export { RenderVideoPublisher, RenderVideoSubscriber };
