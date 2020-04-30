import React, {useState, useEffect} from 'react';
import {StyleSheet, Button, View, Text, Dimensions} from 'react-native';

import {RTCView} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';

import AudioBridge from '../janus/model/audio_bridge';

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150,
  },
  remoteView: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 2.35,
  },
});

const AudioBridgeUI = ({room, secret, pin}) => {
  const [playerState, setPlayerState] = useState('Ready');
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [stats, setStats] = useState('');

  let [audioBridge, setAudioBridge] = useState(new AudioBridge(room));

  useEffect(() => {
    InCallManager.start({media: 'audio'});
    const onremotestream = stream => {
      console.warn('got steream');
      setStream(stream);
      if (audioBridge.isLive()) {
        setPlayerState('Live');
      }
    };

    const oncleanup = () => {
      setPlayerState('Paused');
      setIsMuted(false);
    };

    audioBridge.on('onremotestream', onremotestream);
    audioBridge.on('oncleanup', oncleanup);
    return () => {
      audioBridge.removeListener('onremotestream', onremotestream);
      audioBridge.removeListener('oncleanup', oncleanup);
    };
  }, [room, audioBridge]);

  console.warn('audio rendered');
  let debug = `record? ${InCallManager.recordPermission} Num tracks = ${
    stream ? stream.getAudioTracks().length : -1
  }. Link status ${
    playerState === 'Live'
      ? audioBridge.plugin.webrtcStuff.pc &&
        audioBridge.plugin.webrtcStuff.pc.iceConnectionState
      : 'noconn'
  } 
  Mute? ${isMuted ? 'yes' : 'no'}
    `;

  return (
    <View>
      <Text>Audio Player</Text>
      <Button
        onPress={() =>
          audioBridge
            .connect()
            .then(() => {
              console.log('Joined Bridge');
              setPlayerState('Live');
            })
            .catch(() => setPlayerState('Error'))
        }
        title="Join"
      />

      <Text>
        {debug} {playerState}
      </Text>

      {playerState === 'Live' && (
        <View>
          <Button
            onPress={() => {
              isMuted
                ? audioBridge.unmuteAudio().then(() => {
                    setIsMuted(false);
                  })
                : audioBridge.muteAudio().then(() => {
                    setIsMuted(true);
                    InCallManager.stop();
                  });
            }}
            title={isMuted ? 'unmute' : 'mute'}
          />
          <Text> -- </Text>
          <Button
            onPress={() => {
              InCallManager.setSpeakerphoneOn(!speaker);
              setSpeaker(!speaker);
            }}
            title={speaker ? 'Turn off speaker' : 'Turn on Speaker '}
          />
          <Text> -- </Text>
          <Button
            onPress={() => {
              audioBridge.plugin.webrtcStuff.pc &&
                audioBridge.plugin.webrtcStuff.pc.getStats().then(s => {
                  console.log('stats ->', s);
                  setStats(JSON.stringify(s));
                });
            }}
            title={'Get Stats'}
          />
          <Text> -> {stats} </Text>
        </View>
      )}

      {stream && (
        <RTCView streamURL={stream.toURL()} style={styles.remoteView} />
      )}
    </View>
  );
};

export default AudioBridgeUI;
