const authController = require("../controllers/auth.controller");
const checkAuth = require("../middlewares/checkAuth");
const express = require("express");
const router = express.Router();

router.get("/test", authController.test);

router.post("/login", authController.loginWithPhone);
router.post("/sign-up-email", authController.signUpEmail);
router.post("/forgot-pass-email", authController.forgotPassEmail);
router.post("/login-doctor", authController.loginWithPhoneForDoctor);
router.get("/staffInfo", checkAuth, authController.getInfo);
router.get("/init-password", authController.initPassword);
router.post("/update-password", authController.updatePassword);

//login with native app
router.post("/staff-login", authController.staffLoginWithPhone);

module.exports = router;
