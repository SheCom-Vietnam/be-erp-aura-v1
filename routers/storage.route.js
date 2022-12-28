const express = require("express");
const { route } = require("./payme.route");
const vngStorageController = require("../controllers/vngStorage.controller");
const router = express.Router();

router.get("/getAccessToken", vngStorageController.getAccesskey);
router.get("/storage", vngStorageController.uploadLoadToVng);
module.exports = router;
