const larkController = require("../controllers/lark.controller");
const express = require("express");
const router = express.Router();

router.get("/tenant-token", larkController.getTenantToken);
router.post("/bitable/create-record", larkController.createARecord);
router.post("/send-message", larkController.sendMessage);

//user
router.post("/users/attendance_records", larkController.getRecordsAttendanceOfUser); //Lấy danh sách chấm công trên lark của user trên lark

module.exports = router;
