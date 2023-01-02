const oaZaloController = require("../controllers/oaZalo.controller");
const express = require("express");
const router = express.Router();

router.get("/send-message-oa/:_zalo/:_mess", oaZaloController.openApiMessage);
// router.get("/accessToken", oaZaloController.getAccessToken);
router.post("/webhook", oaZaloController.znsCallback);
router.post("/rating-zns", oaZaloController.ratingZNS);
router.post("/send-message-image-oa", oaZaloController.openApiMessageImageOa);
module.exports = router;
