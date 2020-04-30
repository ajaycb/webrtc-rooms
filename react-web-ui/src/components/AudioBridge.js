import React, { useRef, useState, useEffect } from "react";

import { AudioBridge } from "janus-api";

const visualizer = (stream, ref) => {
  let context = new AudioContext();
  ref.current.style.backgroundColor = "red";

  let analyser = context.createScriptProcessor(1024, 1, 1);
  let source = context.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.connect(context.destination);

  analyser.onaudioprocess = function (e) {
    if (!ref.current) return;
    var out = e.outputBuffer.getChannelData(0);
    var int = e.inputBuffer.getChannelData(0);
    var max = 0;
    for (var i = 0; i < int.length; i++) {
      out[i] = int[i]; // set the output as the input
      max = int[i] > max ? int[i] : max;
    }
    ref.current.style.transform = `scale(${1 + max},${1 + max})`;
  };
};
const AudioBridgeUI = ({ room, secret, pin }) => {
  const [playerState, setPlayerState] = useState("Ready");
  const [isMuted, setIsMuted] = useState(false);
  let [audioBridge, setAudioBridge] = useState(new AudioBridge(room));

  const videoArea = useRef(null);
  const bridgeVolumeIndicator = useRef(null);
  let currentStream;
  useEffect(() => {
    const onremotestream = (stream) => {
      visualizer(stream, bridgeVolumeIndicator);
      console.log(
        "attaching ",
        stream,
        "to",
        videoArea.current,
        "(cs = )",
        currentStream
      );
      if (videoArea.current && currentStream !== stream) {
        console.log("sessing stream", stream, " to ", videoArea.current);
        try {
          videoArea.current.srcObject = stream;
          currentStream = stream;
        } catch (e) {
          videoArea.current.src = URL.createObjectURL(stream);
          currentStream = stream;
        }
      }
      if (audioBridge.isLive()) {
        setPlayerState("Live");
      }
    };

    const oncleanup = () => {
      setPlayerState("Paused");
      setIsMuted(false);
    };

    audioBridge.on("onremotestream", onremotestream);
    audioBridge.on("oncleanup", oncleanup);
    return () => {
      audioBridge.removeListener("onremotestream", onremotestream);
      audioBridge.removeListener("oncleanup", oncleanup);
    };
  }, [room]);

  let debug = `Num tracks = ${
    currentStream ? currentStream.getAudioTracks().length : -1
  }. Link status ${
    playerState === "Live"
      ? audioBridge.plugin.webrtcStuff.pc &&
        audioBridge.plugin.webrtcStuff.pc.iceConnectionState
      : "noconn"
  }
    `;

  return (
    <div className="janus-video">
      <button
        onClick={() =>
          audioBridge
            .connect()
            .then(() => {
              console.log("Joined Bridge");
              setPlayerState("Live");
            })
            .catch(() => setPlayerState("Error"))
        }
      >
        Join
      </button>
      <div style={{ width: "80%", wordWrap: "break-word" }}>{debug}</div>
      {playerState}
      {playerState === "Live" && (
        <div>
          <button
            onClick={() => {
              isMuted
                ? audioBridge
                    .unmuteAudio()
                    .then(() => setIsMuted(audioBridge.isAudioMuted()))
                : audioBridge
                    .muteAudio()
                    .then(() => setIsMuted(audioBridge.isAudioMuted()));
            }}
          >
            {isMuted ? "unmute" : "mute"}{" "}
          </button>
        </div>
      )}
      <div
        ref={bridgeVolumeIndicator}
        style={{
          height: "10px",
          width: "10px",
          backgroundColor: "grey",
          borderRadius: "50%",
        }}
      />
      <audio ref={videoArea} width="100%" height="100%" autoPlay />
    </div>
  );
};

export default AudioBridgeUI;
