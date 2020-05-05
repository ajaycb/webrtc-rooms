import React from "react";
import {
  RenderVideoPublisher,
  RenderVideoSubscriber,
} from "./room/RenderVideo";
import {
  VideoPublisher as VideoPublisherData,
  VideoSubscriber as VideoSubscriberData,
} from "janus-api";

import styled from "styled-components";

const StyledVideo = styled.div`
  border-radius: 10px;
  video {
    border-radius: 10px;
    object-fit: cover;
  }
`;
const VideoPublisher = ({ room, secret, pin, media }) => {
  return (
    <RenderVideoPublisher
      room={room}
      secret={secret}
      pin={pin}
      media={media}
      render={({ videoPublisher, status, videoRef }) => {
        return (
          <StyledVideo>
            <video autoPlay playsInline ref={videoRef} muted />
          </StyledVideo>
        );
      }}
    />
  );
};

const VideoSubscriber = ({ feed }) => {
  return (
    <RenderVideoSubscriber
      room={feed.room}
      feed={feed}
      render={({ videoPublisher, status, videoRef }) => {
        return (
          <StyledVideo>
            <video autoPlay playsInline ref={videoRef} controls />
          </StyledVideo>
        );
      }}
    />
  );
};

const VideoFeedConfig = {
  type: "videoroom",
  local: { data_provider: VideoPublisherData, component: VideoPublisher },
  remote: { data_provider: VideoSubscriberData, component: VideoSubscriber },
};

export { VideoPublisher, VideoSubscriber, VideoFeedConfig };
