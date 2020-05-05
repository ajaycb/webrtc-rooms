import React, { useState } from "react";
import {
  Box,
  Button,
  Collapsible,
  Heading,
  Grommet,
  TextInput,
  Grid,
} from "grommet";
import { Notification } from "grommet-icons";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Janus } from "janus-api";
import { FeedTypes } from "janus-api/room";
import withRoom from "./components/room/withRoom";
import Participants from "./components/Participants";
import { VideoPublisher, VideoFeedConfig } from "./components/Video";

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

const registeredFeedTypes = new FeedTypes().register(VideoFeedConfig);
const SimpleRoom = withRoom(
  { url: "wss://janusws.jobsito.com" },
  registeredFeedTypes,
  Janus,
  ({ room, loading, user, status, render }) => {
    if (loading) return <div>Loading</div>;
    if (room && room.janus) return render({ room, user });

    console.warn("nothign to render", status, room);
  }
);

const Pub = ({ roomId, user }) => (
  <SimpleRoom
    roomId={roomId}
    user={user}
    render={({ room, user }) => (
      <div>
        <Participants room={room} />
        <VideoPublisher room={room} />
      </div>
    )}
  />
);
const Sub = ({ roomId }) => {
  let [user, setUser] = useState(null);
  let [input, setInput] = useState("");

  if (!user) {
    return (
      <div>
        Enter your name
        <TextInput
          siz
          e="medium"
          placeholder="Name"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {input && (
          <Button
            label="Start"
            onClick={() => setUser({ id: input, name: input })}
          ></Button>
        )}
      </div>
    );
  }
  return (
    <div>
      Hi {user.name}
      <SimpleRoom
        roomId={roomId}
        user={user}
        render={({ room }) => (
          <div>
            <div>
              <Participants room={room} />
            </div>
          </div>
        )}
      />
    </div>
  );
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
                <Route path="/publish1">
                  <Pub roomId={568} user={{ id: 101, name: "Moderator-1" }} />
                </Route>
                <Route path="/publish2">
                  <Pub roomId={568} user={{ id: 102, name: "Moderator-2" }} />
                </Route>
                <Route path="/sub">
                  <Sub roomId={568} />
                  {/* <WithRoom
                    roomId={568}
                    user={{ id: 301, name: "Canvas301" }}
                    render={({ room }) => (
                      <div>
                        <Answer room={room} />
                        <WhiteBoard room={room} showTools={false} />
                      </div>
                    )}
                  /> */}
                </Route>
                <Route path="/">
                  <nav>
                    <ul>
                      <li>
                        <Link to="/">Home</Link>
                      </li>
                      <li>
                        <Link to="/publish1">Pub 1 </Link>
                      </li>
                      <li>
                        <Link to="/publish2">Pub 2 </Link>
                      </li>
                      <li>
                        <Link to="/sub">Sub</Link>
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
