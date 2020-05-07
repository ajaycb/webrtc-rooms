import React, { useState, useEffect } from "react";
import { WhiteBoardData } from "janus-api";
import Board from "./board/index";

const WhiteBoardPublisher = ({ room, ...otherProps }) => {
  let [myFeed] = useState(
    room.findOrCreateMyFeed("whiteboard", "default").makeLive()
  );
  const whiteBoardPublisher = myFeed.data_provider;

  return <Board boardRoom={whiteBoardPublisher} {...otherProps} />;
};

const WhiteBoardSubscriber = ({ feed, ...otherProps }) => {
  return (
    <Board boardRoom={feed.data_provider} showTools={false} {...otherProps} />
  );
};

const WhiteBoardFeedConfig = {
  type: "whiteboard",
  local: { data_provider: WhiteBoardData, component: WhiteBoardPublisher },
  remote: { data_provider: WhiteBoardData, component: WhiteBoardSubscriber },
};

export { WhiteBoardPublisher, WhiteBoardSubscriber, WhiteBoardFeedConfig };
