import React, { useState, useEffect } from "react";
import { Box, Button, Collapsible, Heading, Grommet } from "grommet";
import { Notification } from "grommet-icons";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Room from "./components/Room";
import Chat from "./components/Chat";
import VideoPub from "./components/VideoPublisher";
import { VideoPublisher } from "janus-api";
import VideoSub from "./components/VideoSubscriber";
import AudioBridge from "./components/AudioBridge";
import Board from "./components/board/index";
import WhiteBoard from "./components/WhiteBoard";
import { Ask, Answer } from "./components/Ask";

const theme = {
  global: {
    colors: {
      brand: "#228BE6",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

const AppBar = (props) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: "1" }}
    {...props}
  />
);

const Pub = ({ user = { id: 111, name: "Ajay" } }) => (
  <Room
    roomId={568}
    user={user}
    Child={({ room }) => (
      <div>
        <Chat room={room} />
        {/* <VideoPub room={room} media={{ video: "stdres" }} /> */}

        {/* <AudioBridge room={room} /> */}
        <Ask room={room} />
        <WhiteBoard room={room} />
      </div>
    )}
  />
);
const Sub = ({ user = { id: 201, name: "Foo201" } }) => (
  <Room
    roomId={568}
    user={user}
    Child={({ room }) => (
      <div>
        Sub {user.name} <Chat room={room} />
        {/* <VideoSub room={room} /> */}
        <AudioBridge room={room} />
      </div>
    )}
  />
);

const VideoSubs = ({ room, pub }) => {
  let [users, setUsers] = useState(pub.participants);
  let [currentSub, setCurrentSub] = useState(null);
  useEffect(() => {
    let addPublisher = () => {
      setUsers({ ...pub.participants });
    };
    let unsubscribePublisher = (p) => {
      if (!pub.participants[currentSub]) {
        setCurrentSub(null);
      }
      setUsers({ ...pub.participants });
    };

    pub.on("joined", addPublisher);
    pub.on("publishers", addPublisher);
    pub.on("unpublished", unsubscribePublisher);
    const cleanup = () => {
      pub.removeListener("joined", addPublisher);
      pub.removeListener("publishers", addPublisher);
      pub.removeListener("unpublished", unsubscribePublisher);
    };
    return cleanup;
  }, [pub]);

  return (
    <div>
      List {Object.entries(users).length} {currentSub ? currentSub : "no sub"}
      {currentSub && <VideoSub room={room} feed={currentSub} />}
      {Object.values(users).map((u) => (
        <div onClick={() => setCurrentSub(u.id)} key={u.id}>
          {JSON.stringify(u)}
        </div>
      ))}
    </div>
  );
};

const VideoPubSubChild = ({ room }) => {
  const [pub, setPub] = useState(new VideoPublisher(room));

  return (
    <div key={"d1"}>
      Sub {room.user.name} <Chat key={"p2"} room={room} />
      <VideoPub key={"p1"} room={room} videoPublisher={pub} />
      {pub && <VideoSubs room={room} pub={pub} />}
    </div>
  );
};
const VideoPubSub = ({ user = { id: 201, name: "Foo201" } }) => {
  return <Room key={568} roomId={568} user={user} Child={VideoPubSubChild} />;
};

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <Grommet theme={theme} full>
      <Router basename={"/"}>
        <Box fill>
          <AppBar>
            <Heading level="3" margin="none">
              <Link to="/">Home</Link>
            </Heading>
            <Button
              icon={<Notification />}
              onClick={() => setShowSidebar(!showSidebar)}
            />
          </AppBar>
          <Box direction="row" flex overflow={{ horizontal: "hidden" }}>
            <Box flex align="center" justify="center">
              <Switch>
                <Route path="/publish">
                  <Pub />
                </Route>
                <Route path="/subscribe1">
                  <Sub user={{ id: 201, name: "Sub1" }} />
                </Route>
                <Route path="/subscribe2">
                  <Sub user={{ id: 202, name: "Sub2" }} />
                </Route>
                <Route path="/subscribe3">
                  <Sub user={{ id: 203, name: "Sub3" }} />
                </Route>
                <Route path="/video1">
                  <VideoPubSub user={{ id: 301, name: "Video1" }} />
                </Route>
                <Route path="/canvas">
                  <Board />
                </Route>
                <Route path="/canvas_sub">
                  <Room
                    roomId={568}
                    user={{ id: 301, name: "Canvas301" }}
                    Child={({ room }) => (
                      <div>
                        <Answer room={room} />
                        <WhiteBoard room={room} showTools={false} />
                      </div>
                    )}
                  />
                </Route>
                <Route path="/">
                  <nav>
                    <ul>
                      <li>
                        <Link to="/">Home</Link>
                      </li>
                      <li>
                        <Link to="/publish">Pub </Link>
                      </li>
                      <li>
                        <Link to="/subscribe1">subscribe 1</Link>
                      </li>
                      <li>
                        <Link to="/subscribe2">subscribe 2</Link>
                      </li>
                      <li>
                        <Link to="/subscribe3">subscribe 3</Link>
                      </li>
                      <li>
                        <Link to="/video1">Video 1</Link>
                      </li>
                      <li>
                        <Link to="/canvas">Canvas Pub</Link>
                      </li>
                      <li>
                        <Link to="/canvas_sub">Canvas Sub</Link>
                      </li>
                    </ul>
                  </nav>
                </Route>
              </Switch>
            </Box>
            {showSidebar && (
              <Collapsible direction="horizontal" open={showSidebar}>
                <Box
                  flex
                  width="medium"
                  background="light-2"
                  elevation="small"
                  align="center"
                  justify="center"
                >
                  Sidebar
                </Box>
              </Collapsible>
            )}
          </Box>
        </Box>
      </Router>
    </Grommet>
  );
}

export default App;
