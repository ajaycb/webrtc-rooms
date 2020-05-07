var express = require("express");
const crypto = require("crypto");
const JanusAdmin = require("../janus-admin/api");
var router = express.Router();

function getJanusToken(
  secret,
  data = [
    "janus.plugin.videoroom",
    "janus.plugin.audiobridge",
    "janus.plugin.textroom",
  ],
  realm = "janus",
  timeout = 24 * 60 * 60
) {
  const expiry = Math.floor(Date.now() / 1000) + timeout;

  const strdata = [expiry.toString(), realm, ...data].join(",");
  const hmac = crypto.createHmac("sha1", secret);
  hmac.setEncoding("base64");
  hmac.write(strdata);
  hmac.end();

  return [strdata, hmac.read()].join(":");
}

const janus_admin = new JanusAdmin(process.env.JANUS_ADMIN_URL);

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/create/:room", function (req, res, next) {
  const token = getJanusToken(process.env.JANUS_TOKEN_SECRET);
  const { videoroom, textroom, audiobridge } = req.body.plugins;
  const ret_promises = [];
  const roomId = parseInt(req.params.room);

  if (videoroom) {
    ret_promises.push(
      janus_admin.videoroom.createIfNotExists(roomId, videoroom)
    );
  }
  if (textroom) {
    ret_promises.push(janus_admin.textroom.createIfNotExists(roomId, textroom));
  }
  if (audiobridge) {
    ret_promises.push(
      janus_admin.audiobridge.createIfNotExists(roomId, audiobridge)
    );
  }
  Promise.all(ret_promises).then((plugins) =>
    res.send({
      roomId,
      janus: { token, url: process.env.JANUS_URL },
      ok: true,
      plugins,
    })
  );
});

router.post("/delete/:room", function (req, res, next) {
  const { videoroom, textroom, audiobridge } = req.body.plugins;
  const ret_promises = [];
  const roomId = parseInt(req.params.room);

  if (videoroom) {
    ret_promises.push(janus_admin.videoroom.destroy(roomId, videoroom));
  }
  if (textroom) {
    ret_promises.push(janus_admin.textroom.destroy(roomId, textroom));
  }
  if (audiobridge) {
    ret_promises.push(janus_admin.audiobridge.destroy(roomId, audiobridge));
  }
  Promise.all(ret_promises).then((plugins) => res.send({ plugins }));
});

router.all("/close/:token", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
