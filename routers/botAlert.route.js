const BotOrderAlertController = require("../controllers/botAlert.controller");
const express = require("express");
const router = express.Router();

router.post("/order/send-message", BotOrderAlertController.botAlertOrder);
router.post("/booking/send-message", BotOrderAlertController.botAlertOrder);

router.post("/add-bot", BotOrderAlertController.addBotLark);

module.exports = router;
