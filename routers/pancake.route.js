const pancakeController = require("../controllers/pancake.controller");
const express = require("express");
const router = express.Router();

router.post("/hook", pancakeController.hookCustomer);
router.put("/hook/:_id", pancakeController.hookCustomer);
router.post("/check_pancake_name", pancakeController.checkPancakeName);
router.get("/testhook", pancakeController.testHook);
module.exports = router;
