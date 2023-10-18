const BotAlertController = require("../controllers/botAlert.controller");
const express = require("express");
const router = express.Router();

router.post("/send-message", BotAlertController.botAlertOrder);

router.post("/add-bot", BotAlertController.addBotLark);

module.exports = router;
