const larkController = require("../controllers/lark.controller");
const express = require("express");
const router = express.Router();

router.get("/tenant-token", larkController.getTenantToken);
router.post("/bitable/create-record", larkController.createARecord);

module.exports = router;
