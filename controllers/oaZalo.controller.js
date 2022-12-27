const oaZaloServices = require("../services/oaZalo.services");
const catchAsync = require("../helpers/catchAsync");
const moment = require("moment");
const AppError = require("../helpers/appError");
const SHA256 = require("crypto-js/sha256");
const { znsZaloRatingTemplate } = require("../services/znsZalo.services");
const {
  convertZaloPhoneToPhone,
} = require("../helpers/convert/convertToVnPhone");
const supabase = require("../config/supabase");
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
      console.log(e);
    }
  };
  ratingZNS = catchAsync(async (req, res, next) => {
    const { phone, zaloId, name, bookingId } = req.body;
    const accessToken = await this._getAccessToken();
    console.log(accessToken);
    const response = await znsZaloRatingTemplate(
      accessToken,
      phone,
      name,
      bookingId,
      zaloId
    );
    console.log(response);
    if (response && response.status === 200) {
      return res.status(200).send({
        data: response.data,
      });
    } else {
      return next(new AppError("Send Message Failed", 500));
    }
  });
  znsCallback = catchAsync(async (req, res, next) => {
    const zaloResponse = req.body;
    const hashedSha256 = `mac=${SHA256(
      `${process.env.ZALO_ZNS_KEY}${JSON.stringify(zaloResponse)}${
        zaloResponse.timestamp
      }${process.env.ZALO_OA_SECRECT_KEY}`
    )}`.toString();
    if (hashedSha256 !== req.headers["x-zevent-signature"]) {
      return next(new AppError("Invalid Header", 400));
    }
    res.status(200).send({
      status: "Success",
    });
    const { event_name } = req.body;
    console.log(req.body);
    if (event_name === "user_received_message") {
      const { recipient } = req.body;
      const { data, error: getUserErrror } = await supabase
        .from("users")
        .select("zns_received")
        .eq("phone", convertZaloPhoneToPhone(recipient.id))
        .single();
      if (getUserErrror) {
        console.log("Update zns_reciedved failed");
      } else if (data) {
        const { data: updatedZnsReceived, error: updatedZnsReceivedError } =
          await supabase
            .from("users")
            .update({ zns_received: data.zns_received + 1 })
            .eq("phone", convertZaloPhoneToPhone(recipient.id))
            .select("zns_received");
        console.log(updatedZnsReceived);
        if (updatedZnsReceivedError) {
          console.log("Update zns_reciedved failed");
        }
      }
    }
    if (event_name === "user_feedback") {
      const { message } = req.body;
      //   message: {
      //   note: '',
      //   rate: 3,
      //   submit_time: '1672124290479',
      //   feedbacks: null,
      //   msg_id: '1c6a918f3a4c72112b5e',
      //   tracking_id: '241392'
      // },
      // const { data, error: getUserErrror } = await supabase
      //   .from("users")
      //   .select("zns_received")
      //   .eq("zalo_id", message.tracking_id)
      //   .single();
      // if (getUserErrror) {
      //   console.log("Update zns_recieved failed");
      // } else if (data) {
      //   const { data: updatedZnsReceived, error: updatedZnsReceivedError } =
      //     await supabase
      //       .from("users")
      //       .update({ zns_received: data.zns_received + 1 })
      //       .eq("phone", convertZaloPhoneToPhone(recipient.id))
      //       .select("zns_received");
      //   console.log(updatedZnsReceived);
      //   if (updatedZnsReceivedError) {
      //     console.log("Update zns_recieved failed");
      //   }
      // }
    }
  });
}
module.exports = new OAZaloController();
