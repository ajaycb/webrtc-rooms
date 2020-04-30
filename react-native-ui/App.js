/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import RoomContainer from './components/Room';
import AudioBridgeUI from './components/AudioBridge';
import VideoPublisher from './components/VideoPublisher';
import VideoSubscriber from './components/VideoSubscriber';
import VideoPublisherModel from './janus/model/publisher';

const VideoSubs = ({room, pub}) => {
  let [users, setUsers] = useState(pub.participants);
  let [currentSub, setCurrentSub] = useState(null);
  useEffect(() => {
    let addPublisher = p => {
      setUsers({...pub.participants});
    };
    let unsubscribePublisher = p => {
      if (p.unpublished === currentSub) {
        setCurrentSub(null);
      }
      setUsers({...pub.participants});
    };
    pub.on('joined', addPublisher);
    pub.on('publishers', addPublisher);
    pub.on('unpublished', unsubscribePublisher);
    const cleanup = () => {
      pub.removeListener('joined', addPublisher);
      pub.removeListener('publishers', addPublisher);
      pub.removeListener('unpublished', unsubscribePublisher);
    };
    return cleanup;
  }, [pub]);

  return (
    <View>
      <Text>
        List {Object.entries(users).length} -{' '}
        {currentSub ? currentSub : 'no sub'}
      </Text>
      {currentSub && <VideoSubscriber room={room} feed={currentSub} />}

      {Object.values(users).map(u => (
        <Button
          onPress={() => setCurrentSub(u.id)}
          key={u.id}
          title={`${u.name} (${u.id})`}
        />
      ))}
    </View>
  );
};

const VideoSubChild = ({room}) => {
  const [videopub] = useState(new VideoPublisherModel(room));
  return (
    <View>
      <Text>Sub {room.user.name} </Text>
      {/* <VideoPublisher room={room} videopub={videopub} />
      <VideoSubs room={room} pub={videopub} /> */}
      <AudioBridgeUI room={room} />
    </View>
  );
};
const Sub = ({user}) => {
  return <RoomContainer roomId={568} user={user} Child={VideoSubChild} />;
};

const App: () => React$Node = () => {
  const user = {id: 401, name: 'Mobile1'};
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionDescription}>Janus Test</Text>
              <Sub user={user} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
