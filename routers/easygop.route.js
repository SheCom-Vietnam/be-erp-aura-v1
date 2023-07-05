const EasygopController = require("../controllers/easygop.controller");
const express = require("express");
const router = express.Router();

router.post("/acquire-user", EasygopController.acquireNewUser);
module.exports = router;
