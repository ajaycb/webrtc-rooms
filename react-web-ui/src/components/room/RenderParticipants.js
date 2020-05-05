import React, { useEffect, useState } from "react";

const RenderParticipants = ({ room, render }) => {
  let [participants, setParticipants] = useState(
    Object.values(room.participants)
  );

  useEffect(() => {
    const update_participants = () => {
      setParticipants(Object.values(room.participants));
    };
    room.on("participants_changed", update_participants);
    return () => {
      room.removeListener("participants_changed", update_participants);
    };
  }, [room]);

  return render({ participants });
};
export default RenderParticipants;
