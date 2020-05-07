import React, { useEffect, useState } from "react";
import Room from "janus-api";

export default function withRoom(url, feed_types, Janus, Wrap) {
  return ({ roomId, user, ...otherProps }) => {
    const [state, setState] = useState({ status: "loading", room: null });

    useEffect(() => {
      fetch(`${url}/rooms/create/${roomId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plugins: { videoroom: {}, textroom: {} } }),
      })
        .then((resp) => resp.json())
        .then((result) => {
          const { roomId, janus, ok } = result;
          console.log("Connecting to Janus:", roomId, result, janus);
          let myroom = new Room(user, roomId, Janus, feed_types);
          myroom
            .connect(janus)
            .then(() => {
              myroom.on("hangup", () => setState({ status: "hangup" }));
              setState({ status: "active", room: myroom });
            })
            .catch(() => setState({ status: "error" }));
        });
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
