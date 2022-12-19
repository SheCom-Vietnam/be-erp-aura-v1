const pushNotifyController = require("../controllers/pushnotify.controller");
const express = require("express");
const router = express.Router();

//router khách hàng đặt lịch xong push noti cho nhân viên tại clinic đó  // App Lễ Tân
router.post("/staffs/clinic/:_clinicId/:_bookingId/:_userId", pushNotifyController.pushNotiAllStaffOfClinic);

//router lễ tân check-in cho khách-> push noti cho bác sĩ // App Lễ Tân
router.post("/staff/doctor/:_doctorId/:_bookingId/:_userId", pushNotifyController.staffPushNotiForDoctor);

//router bác sĩ hoàn thành booking-> push noti cho nhân viên // App Bác Sĩ
router.post("/doctor/staff/clinic/:_clinicId/:_bookingId/:_userId", pushNotifyController.doctorPushNotiForStaff);

//router bác sĩ add thêm bác sĩ phụ, bác sĩ phụ xác nhận hoặc từ chối-> push noti cho bác sĩ phụ // App Bác Sĩ
//_status: them || xacnhan || tuchoi
router.post("/doctor/to/doctor/:_doctor1Id/:_bookingId/:_doctor2Id/:_status", pushNotifyController.doctorPushNotiForDoctor);

module.exports = router;
