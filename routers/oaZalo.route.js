const oaZaloController = require("../controllers/oaZalo.controller");
const express = require("express");
const router = express.Router();

router.get("/send-message-oa/:_zalo/:_mess", oaZaloController.openApiMessage);
router.post("/phone-number", oaZaloController.phoneNumber); //get phone number from zalo new flow
router.post("/location", oaZaloController.getLocation); //get location from zalo new flow
router.post("/send/confirm-zns", oaZaloController.sendConfirmBookingZNS);
router.post("/send/welcome-staff", oaZaloController.sendWelcomeStaffZNS);
// router.get("/accessToken", oaZaloController.getAccessToken);

router.post("/send-message-image-oa", oaZaloController.openApiMessageImageOa);
router.post("/send-zns-checkout", oaZaloController.sendZNSCheckout);
router.post("/send-event-checkin", oaZaloController.sendZNSEventCheckin);
router.post(
    "/send-zns-booking-confirmation",
    oaZaloController.sendZNSBookingConfirmation
);
router.post(
    "/test-send-zns-booking-confirmation",
    oaZaloController.sendTestZNSBookingConfirmation
);
router.post(
    "/send-zns-call-confirmation",
    oaZaloController.sendZNSCallConfirmation
);

module.exports = router;
