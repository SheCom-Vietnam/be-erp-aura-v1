const botbanhangController = require("../controllers/botbanhang.controller");
const express = require("express");
const router = express.Router();

router.get("/get-form-value", botbanhangController.getFormValue);
router.post("/get-user-info", botbanhangController.getUserInfo);


module.exports = router;
