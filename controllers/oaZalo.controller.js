const oaZaloServices = require("../services/oaZalo.services");
const catchAsync = require("../helpers/catchAsync");
const moment = require("moment");
const AppError = require("../helpers/appError");
const SHA256 = require("crypto-js/sha256");
const {
  znsConfirmBookingTemplate,
  znsWelcomeStaffTemplate,
} = require("../services/znsZalo.services");
const {
  convertZaloPhoneToPhone,
} = require("../helpers/convert/convertToVnPhone");
const supabase = require("../config/supabase");
const { default: axios } = require("axios");
class OAZaloController {
  _checkTimeAccessToken = (time) => {
    const _time = moment(time).add(1, "days");
    const isValidate = !moment(Date.now()).isAfter(_time); //if date.now is after _time of token (>24h) is invalid
    return isValidate;
  };
  _getAccessToken = async () => {
    try {
      let _token = await oaZaloServices.getTokenOnDb();
      const isValidToken = this._checkTimeAccessToken(_token.time);
      if (!isValidToken) {
        console.log("InvalidToken.Renew");
        const token = await oaZaloServices.reNewOaToken(_token.refresh_token);
        _token = { ..._token, ...token };
        await oaZaloServices.updateNewOaTokenOnDb(_token);
        return token;
      }
      console.log("Get Old Token");
      return _token.access_token;
    } catch (error) {
      throw error;
    }
  };
  openApiMessage = async (req, res) => {
    try {
      let _token = await oaZaloServices.getTokenOnDb();
      const flagTime = oaZaloServices.checkTimeOaToken(_token.time);
      //Nếu quá 25h thì gọi api cấp lại
      if (!flagTime) {
        const token = await oaZaloServices.reNewOaToken(_token.refresh_token);
        _token = { ..._token, ...token };
        await oaZaloServices.updateNewOaTokenOnDb(_token);
      }
      await oaZaloServices.oaSendMessage(
        _token.access_token,
        req.params._zalo,
        req.params._mess
      );
      return res.status(200).send({
        status: "200",
      });
    } catch (e) {
      return next(new AppError("Server Error", 500));
    }
  };

  openApiMessageImageOa = catchAsync(async (req, res, next) => {
    const { zaloId, imageUrl, messageText } = req.body;
    const accessToken = await this._getAccessToken();
    const response = await oaZaloServices.oaSendMessageImageOa(
      zaloId,
      imageUrl,
      messageText,
      accessToken
    );
    if (response && response.message === "Success") {
      return res.status(200).send({
        data: response.data,
        status: "200",
      });
    } else {
      return next(new AppError("Send Message Failed", 500));
    }
  });
  sendConfirmBookingZNS = catchAsync(async (req, res, next) => {
    const {
      phone,
      customerName,
      clinicCity,
      bookingTime,
      bookingId,
      bookingNote,
      clinicAddress,
      bookingLink,
    } = req.body;

    if (
      !phone ||
      !customerName ||
      !clinicCity ||
      !bookingTime ||
      !clinicAddress ||
      !bookingLink
    )
      return next(new AppError("Missing field in body", 400));
    const templateConfig = [
      customerName,
      clinicCity,
      bookingTime,
      bookingId,
      bookingNote ? bookingNote : "Không có",
      clinicAddress,
      bookingLink,
    ];
    const response = await znsConfirmBookingTemplate({
      phone,
      templateConfig,
    });
    if (response && response.data.CodeResult === "100") {
      return res.status(200).send({
        status: "Success",
      });
    } else {
      return next(new AppError("Failed", 400));
    }
  });
  sendWelcomeStaffZNS = catchAsync(async (req, res, next) => {
    const { staffName, phone, staffId, date } = req.body;

    if (!staffName || !phone || !staffId || !date)
      return next(new AppError("Missing field in body", 400));
    const templateConfig = [
      staffName,
      date,
      staffId,
      "https://zalo.me/s/3693082134719524726",
    ];
    const response = await znsWelcomeStaffTemplate({
      phone,
      templateConfig,
    });
    if (response && response.data.CodeResult === "100") {
      return res.status(200).send({
        status: "Success",
      });
    } else {
      return next(new AppError("Failed", 400));
    }
  });

  phoneNumber = catchAsync(async (req, res, next) => {
    const { token, accessToken } = req.body;

    const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: process.env.ZALO_SECRET_KEY,
      },
    });
    //{ data: { number: '84933670101' }, error: 0, message: 'Success' }
    if (response && response.data && response.data.message === "Success") {
      let newPhone = 0;
      if (response.data.data && response.data.data.number) {
        console.log("Không có data.number");
        //Convert "84965xxx" -> "0965xxx"
        newPhone = 0 + response.data.data.number.slice(2);
      }
      return res.status(200).send({
        data: newPhone,
        status: "200",
      });
    } else {
      return next(new AppError("Get Phone Failed", 500));
    }
  });

  getLocation = catchAsync(async (req, res, next) => {
     const { token, accessToken } = req.body;
    const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: process.env.ZALO_SECRET_KEY,
      },
    });

//   {
//   data: {
//     provider: 'gps',
//     latitude: '10.769903',
//     timestamp: '1679892659294',
//     longitude: '106.724698'
//   },
//   error: 0,
//   message: 'Success'
// }
    console.log(response.data)
    if (response && response.data && response.data.message === "Success") {
      return res.status(200).send({
        data: response.data.data,
        status: "200",
      });
    } else {
      return next(new AppError("Get Location Failed", 500));
    }
  });

  
}
module.exports = new OAZaloController();
