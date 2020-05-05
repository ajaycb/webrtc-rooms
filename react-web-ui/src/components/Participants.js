import React, { useState, useEffect } from "react";
import RenderParticipants from "./room/RenderParticipants";

const FeedWidget = ({ feed }) => {
  const [connected, setConnected] = useState(false);
  const Widget = feed.feed_type.component;
  return (
    <div>
      {feed.type}
      {connected === false && !feed.is_local && (
        <button
          onClick={() => {
            console.log("using ", feed.feed_type.component);
            setConnected(true);
          }}
        >
          Connect
        </button>
      )}
      {connected === true && <Widget feed={feed} />}
    </div>
  );
};

const Participants = ({ room }) => (
  <RenderParticipants
    room={room}
    render={({ participants }) => {
      return (
        <div>
          {participants.length} participants
          <ul>
            {participants.map((p, i) => (
              <li key={i}>
                {p.user.name}{" "}
                {Object.values(p.feeds).map((feed, i) => (
                  <FeedWidget key={feed.key} feed={feed} />
                ))}
              </li>
            ))}
          </ul>
        </div>
      );
    }}
  />
);
export default Participants;
