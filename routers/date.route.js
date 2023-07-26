const DateController = require("../controllers/date.controller");
const express = require("express");
const router = express.Router();

router.get("/get-time", DateController.getCurrentTime);

module.exports = router;
