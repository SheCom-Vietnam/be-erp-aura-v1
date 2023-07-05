const StreamController = require("../controllers/stream.controller");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post("/getStreamKey", StreamController.CreateActivityAPIV2, StreamController.GetStreamsAPI);
router.get("/getToken", StreamController.GetToken);
router.get("/receiveStatus", StreamController.receiveStatusLive);
router.post("/upload/media", upload.single("file"), StreamController.uploadImage);
module.exports = router;
