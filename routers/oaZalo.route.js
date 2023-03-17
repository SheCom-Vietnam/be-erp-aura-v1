const oaZaloController = require("../controllers/oaZalo.controller");
const express = require("express");
const router = express.Router();

router.get("/send-message-oa/:_zalo/:_mess", oaZaloController.openApiMessage);
router.post("/phone-number", oaZaloController.phoneNumber); //get phone number from zalo new flow
router.post("/send/confirm-zns", oaZaloController.sendConfirmBookingZNS);
router.post("/send/welcome-staff", oaZaloController.sendWelcomeStaffZNS);
// router.get("/accessToken", oaZaloController.getAccessToken);

router.post("/send-message-image-oa", oaZaloController.openApiMessageImageOa);
module.exports = router;
