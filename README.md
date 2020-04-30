Steps to install

1. docker-compose build
   this will setup janus locally
   the dockerfile is mostly from https://github.com/atyenoria/janus-webrtc-gateway-docker

   you will also need to setup https - later on this
   on your development machine you can use a solution like dinghy (https://github.com/codekitchen/dinghy) which has a http gateway out-of-the-box
   or can use something like https://github.com/nginx-proxy/nginx-proxy

2. under react-web-ui
   run yarn
   run yarn start to play around with the UI components

Features:

1. Janus API that implements janus protocol for the following plugins
   a. audiobrige
   b. videoroom - publishers and subscribers
   c. textroom
2. Added Functionality like chat, polls, whiteboard on top of textroom

Plan:

1. Create a separate node app to factor out a shared room state which can act as a point of sync for all participants
2. Better default styling for the components
3. reconnect on failure
4. Mobile support via React Native of all web components
