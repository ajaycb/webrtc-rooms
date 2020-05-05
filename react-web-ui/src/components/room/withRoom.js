import React, { useEffect, useState } from "react";
import Room from "janus-api";

export default function withRoom(config, feed_types, Janus, Wrap) {
  return ({ roomId, user, ...otherProps }) => {
    const [state, setState] = useState({ status: "loading", room: null });

    useEffect(() => {
      let myroom = new Room(user, roomId, Janus, feed_types);
      myroom
        .connect(config)
        .then(() => {
          myroom.on("hangup", () => setState({ status: "hangup" }));
          setState({ status: "active", room: myroom });
        })
        .catch(() => setState({ status: "error" }));
    }, [roomId]);

    return (
      <Wrap
        user={user}
        room={state.room}
        loading={state.status === "loading" ? true : false}
        status={state.status}
        {...otherProps}
      />
    );
  };
}
