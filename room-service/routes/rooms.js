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

const janus_admin = new JanusAdmin(process.env.JANUS_URL);

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.all("/create", function (req, res, next) {
  const token = getJanusToken(process.env.JANUS_TOKEN_SECRET);
  res.send({ resp: "need to create room now!", token });
});

router.all("/close/:token", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
