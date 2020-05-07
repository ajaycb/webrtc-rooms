Steps to install

1. cd janus
   change the config with auth (passwords eg)

   docker-compose build (optional - this will setup janus locally)
   the dockerfile is mostly from https://github.com/atyenoria/janus-webrtc-gateway-docker
   you will also need to setup https - later on this
   on your development machine you can use a solution like dinghy (https://github.com/codekitchen/dinghy) which has a http gateway out-of-the-box
   or can use something like https://github.com/nginx-proxy/nginx-proxy

   change the secrets in janus/etc/janus/janus.jcfg

   1. token_auth_secret = "secret"
   2. admin_secret = "janusoverlord"

   3. set admin_key = "secret" #use the same password as #1 (token_auth_secret) API server assumes this
      in the following files
      janus/etc/janus/janus.plugin.videoroom.jcfg
      janus/etc/janus/janus.plugin.textroom.jcfg
      janus/etc/janus/janus.plugin.audiobridge.jcfg

   docker-compose up -d -> janus should be up test by hitting /janus/info

2. in the main project directory

create .env file with the following
JANUS_ADMIN_SECRET=janusoverlord
JANUS_TOKEN_SECRET=secret
JANUS_ADMIN_URL=https://janusadmin.my.docker/admin/
JANUS_URL=wss://janus.my.docker/
Note: the url corresponds to the janus server(step 1) reachable over https

docker-compose build
docker-compose up -d  
 this should bring up the node server to communicate with janus

3. cd react-web-ui/
   run yarn
   run yarn start
   to play around with the UI components

Features:

1. Janus API that implements janus protocol for the following plugins
   a. audiobrige
   b. videoroom - publishers and subscribers
   c. textroom
2. Added Functionality like chat, polls, whiteboard on top of textroom

Plan:

1. Create a separate node app to factor out a shared room state which can act as a point of sync for all participants
2. Use websockets for data sync instead of datachannels (easier)
3. Better default styling for the components
4. reconnect on failure
5. Mobile support via React Native of all web components
