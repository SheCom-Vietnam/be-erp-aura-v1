const express = require("express");
const router = express.Router();

router.post("/tenant-token", authController.loginWithPhone);

module.exports = router;
