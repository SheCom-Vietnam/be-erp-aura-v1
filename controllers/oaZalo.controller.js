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

    phoneNumber = catchAsync(async (req, res, next) => {
      const { token, accessToken } = req.body;
      console.log( "token", token )
      console.log( "accessToken", accessToken )
    const response = await axios.get("https://graph.zalo.me/v2.0/me/info",{
      headers: {
        'access_token': accessToken,
        'code': token,
        'secret_key': process.env.ZALO_SECRET_KEY
      }
    });
      console.log(response.data)
      //{ data: { number: '84933670101' }, error: 0, message: 'Success' }
      if (response && response.data && response.data.message === "Success") {
        let newPhone = 0
        if (response.data.data && response.data.data.number) {
          console.log("Không có data.number")
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
}
module.exports = new OAZaloController();
