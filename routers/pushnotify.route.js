const pushNotifyController = require("../controllers/pushnotify.controller");
const express = require("express");
const router = express.Router();

router.post("/staffs/clinic/:_clinicId/:_bookingId/:_userId", pushNotifyController.pushNotiAllStaffOfClinic);

module.exports = router;
