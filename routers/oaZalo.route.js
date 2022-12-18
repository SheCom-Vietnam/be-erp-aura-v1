const oaZaloController = require("../controllers/oaZalo.controller");
const express = require("express");
const router = express.Router();

router.get('/send-message-oa/:_zalo/:_mess', oaZaloController.openApiMessage);
module.exports = router;
