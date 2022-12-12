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
 
}

module.exports = new PushNotifyController();
