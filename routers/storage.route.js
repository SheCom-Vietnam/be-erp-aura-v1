const express = require("express");
const { route } = require("./payme.route");
const vngStorageController = require("../controllers/vngStorage.controller");
const router = express.Router();

router.get("/getStorageKey", vngStorageController.getAccesskey);

module.exports = router;
