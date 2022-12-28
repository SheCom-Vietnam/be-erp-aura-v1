const OmiCallController = require("../controllers/omiCall.controller");
const express = require("express");
const router = express.Router();

router.get("/getOmiInfo", OmiCallController.getOmiInfo);
router.post("/webhook", OmiCallController.webhook);
module.exports = router;
