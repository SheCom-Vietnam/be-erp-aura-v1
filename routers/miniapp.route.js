const MiniAppController = require("../controllers/miniapp.controller");
const express = require("express");
const router = express.Router();

router.post("/hook-user-revoke-consent", MiniAppController.hookRevokeConsent);

module.exports = router;
