const oaZaloController = require("../controllers/oaZalo.controller");
const express = require("express");
const router = express.Router();

router.get("/send-message-oa/:_zalo/:_mess", oaZaloController.openApiMessage);
router.get("/accessToken", oaZaloController.getAccessToken);
router.post("/webhook", oaZaloController.znsCallback);
module.exports = router;
