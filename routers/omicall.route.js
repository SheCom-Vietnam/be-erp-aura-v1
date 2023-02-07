const OmiCallController = require("../controllers/omiCall.controller");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

router.post("/checkOmiEmail", OmiCallController.checkOmiCallEmail);
router.get("/getOmiInfo", OmiCallController.getOmiInfo);
router.post("/webhook", upload.single("filedata"), OmiCallController.webhook);
module.exports = router;
