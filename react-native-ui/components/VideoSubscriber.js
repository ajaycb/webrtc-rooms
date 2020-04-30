import React, {useRef, useState, useEffect} from 'react';

import VideoSubscriber from '../janus/model/subscriber';
import {RTCView} from 'react-native-webrtc';
import {StyleSheet, Dimensions, View, Text} from 'react-native';

const styles = StyleSheet.create({
  selfView: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 3,
  },
  remoteView: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 3,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  listViewContainer: {
    height: 150,
  },
});

const VideoSubscriberUI = ({room, feed, secret, pin}) => {
  const [playerState, setPlayerState] = useState('Ready');
  const [isMuted, setIsMuted] = useState(false);
  const [debug, set_debug] = useState('');
  const [stream, setStream] = useState(null);
  let [videoSubscriber, setVideoSubscriber] = useState(
    new VideoSubscriber(room),
  );

  useEffect(() => {
    const joined = () => {
      setPlayerState('Paused');
    };
    const onremotestream = (stream, param) => {
      console.warn('remote strm', param);
      setStream(stream);
      if (videoSubscriber.isLive()) {
        setPlayerState('Live');
      }

      var videoTracks = stream.getVideoTracks();
      set_debug(
        `Num tracks = ${videoTracks.length}. Link status ${
          videoSubscriber.plugin.webrtcStuff.pc.iceConnectionState
        }`,
      );
      if (
        videoTracks === null ||
        videoTracks === undefined ||
        videoTracks.length === 0
      ) {
        setPlayerState('Error');
      }
    };
    const oncleanup = () => {
      setPlayerState('Paused');
      setIsMuted(false);
    };

    videoSubscriber.on('joined', joined);
    videoSubscriber.on('onremotestream', onremotestream);
    videoSubscriber.on('oncleanup', oncleanup);
    videoSubscriber
      .connect(parseInt(feed, 10))
      .then(() => console.log('Connected'));

    const cleanup = () => {
      videoSubscriber.removeListener('joined', joined);
      videoSubscriber.removeListener('onremotestream', onremotestream);
      videoSubscriber.removeListener('oncleanup', oncleanup);
    };
    return cleanup;
  }, [room, videoSubscriber, feed]);

  return (
    <View>
      <Text>{playerState}</Text>
      {stream && <RTCView streamURL={stream.toURL()} style={styles.selfView} />}
    </View>
  );
};

export default VideoSubscriberUI;
