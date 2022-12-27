const OmiCallController = require("../controllers/omiCall.controller");
const express = require("express");
const router = express.Router();

router.get("/temp", OmiCallController.getToken);

module.exports = router;
