const authController = require("../controllers/auth.controller");
const checkAuth = require("../middlewares/checkAuth");
const express = require("express");
const router = express.Router();

router.post("/login", authController.loginWithPhone);
router.post("/sign-up-email", authController.signUpEmail);
router.post("/forgot-pass-email", authController.forgotPassEmail);
router.post("/login-doctor", authController.loginWithPhoneForDoctor);
router.get("/staffInfo", checkAuth, authController.getInfo);
router.get("/init-password", authController.initPassword);
router.post("/update-password", authController.updatePassword);

module.exports = router;
