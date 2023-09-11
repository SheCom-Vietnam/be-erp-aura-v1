const BotBookingAlertController = require('../controllers/botBookingAlert.controller');
const express = require('express');
const router = express.Router();

router.post('/send-message', BotBookingAlertController.botAlertBooking);
router.post('/add-bot', BotBookingAlertController.addBotLark);

module.exports = router;
