import React, {useRef, useState, useEffect} from 'react';
import VideoPublisher from '../janus/model/publisher';
import {View, Text, StyleSheet, Dimensions, Button} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';

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

const VideoPublisherUI = ({
  room,
  secret,
  pin,
  videopub,
  media = {video: 'lowres'},
}) => {
  const [playerState, setPlayerState] = useState('Ready');
  const [speaker, setSpeaker] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  let [videoPublisher, setVideoPublisher] = useState(
    videopub || new VideoPublisher(room),
  );
  const [feedId, setFeedId] = useState(null);
  let [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    console.warn('VideoPub - Effect');

    const joined = data => {
      setFeedId(data.id);
      setPlayerState('Paused');
    };
    const oncleanup = () => {
      setPlayerState('Paused');
      setIsMuted(false);
    };
    const onlocalstream = stream => {
      setLocalStream(stream);
    };

    videoPublisher.on('joined', joined);
    videoPublisher.on('oncleanup', oncleanup);
    videoPublisher.on('onlocalstream', onlocalstream);

    videoPublisher
      .connect()
      .then(() => {
        setPlayerState('Paused');
      })
      .catch(err => {
        console.error(err);
        setPlayerState('Error');
        setIsMuted(false);
      });

    const cleanup = () => {
      videoPublisher.removeListener('joined', joined);
      videoPublisher.removeListener('oncleanup', oncleanup);
      videoPublisher.removeListener('onlocalstream', onlocalstream);
    };
    return cleanup;
  }, [room, videoPublisher]);

  return (
    <View>
      <Text>
        ID:{feedId} {playerState}{' '}
      </Text>
      <Button
        onPress={() => {
          InCallManager.setSpeakerphoneOn(!speaker);
          setSpeaker(!speaker);
        }}
        title={speaker ? 'Turn off speaker' : 'Turn on Speaker '}
      />

      {playerState === 'Paused' && (
        <Button
          onPress={() => {
            videoPublisher.publish().then(() => {
              setPlayerState('Started');
            });
          }}
          title="Start"
        />
      )}

      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.selfView} />
      )}
    </View>
  );
};

export default VideoPublisherUI;
