const catchAsync = require("../helpers/catchAsync");
const NotifyService = require("../services/pushnotify");

class PushNotifyController {
    pushNotiAllStaffOfClinic = catchAsync(async (req, res, next) => {
    const { _clinicId,_bookingId,_userId } = req.params; 
      if (_clinicId && _bookingId && _userId) {
          const response = await NotifyService.getAllTokenStaffOfClinic(_clinicId)
          if (response) {
              const resFirebase = await NotifyService.sendNotifyNewBookingForStaff(response, _userId, _bookingId)
          }
            return res.status(200).send({
      status: "Success",
    });
}
    });
  
   staffPushNotiForDoctor = catchAsync(async (req, res, next) => {
     const { _doctorId, _bookingId, _userId } = req.params; 
     console.log(req.params)
      if (_doctorId && _bookingId && _userId) {
          const response = await NotifyService.getTokenDoctorById(_doctorId)
          if (response) {
              const resFirebase = await NotifyService.staffSendNotifyNewBookingForDoctor(response, _userId, _bookingId)
          }
            return res.status(200).send({
      status: "Success",
    });
}
   });
  
    doctorPushNotiForStaff = catchAsync(async (req, res, next) => {
    const { _clinicId,_bookingId,_userId } = req.params; 
      if (_clinicId && _bookingId && _userId) {
          const response = await NotifyService.getAllTokenStaffOfClinic(_clinicId)
          if (response) {
              const resFirebase = await NotifyService.doctorSendNotifyDoneBookingForStaff(response, _userId, _bookingId)
          }
            return res.status(200).send({
      status: "Success",
    });
}
    });
  
     doctorPushNotiForDoctor = catchAsync(async (req, res, next) => {
    const { _doctorId,_bookingId,_status} = req.params; 
      if (_doctorId && _bookingId && _status) {
          const response = await NotifyService.getTokenDoctorById(_doctorId)
          if (response) {
              const resFirebase = await NotifyService.doctorSendNotifyForDoctor(response,_doctorId, _bookingId,_status)
          }
            return res.status(200).send({
      status: "Success",
    });
}
   });
 
}

module.exports = new PushNotifyController();
