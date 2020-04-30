import React, {useEffect, useState} from 'react';
import Room from '../janus/model/room';
import {Text} from 'react-native';
const RoomContainer = ({
  config = {},
  loading = <Text>Loading</Text>,
  roomId,
  user,
  Child,
}) => {
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    console.warn('Room - Effect');
    let myroom = new Room(user, roomId);
    myroom
      .connect(config)
      .then(() => {
        myroom.on('hangup', () => setStatus('hangup'));
        setRoom(myroom);
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, [roomId, user]);

  if (room) return <Child room={room} />;
  else if (status === 'loading') return loading;
  else if (status === 'hangup') return <Text>Hangup</Text>;
  else {
    return <Text>Error - {status}</Text>;
  }
};
export default RoomContainer;
