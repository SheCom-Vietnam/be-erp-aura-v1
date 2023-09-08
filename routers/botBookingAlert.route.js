const BotBookingAlertController = require('../controllers/botBookingAlert.controller');
const express = require('express');
const router = express.Router();

router.post('/dental-noti', BotBookingAlertController.botAlertDentalBooking);

module.exports = router;
