const axios = require("axios");
const ZNS_URL =
  "http://rest.esms.vn/MainService.svc/json/SendZaloMessage_V4_post_json/"; //Vihat

const OAID_CONFIRM_BOOKING = "1783272961339323129";
const OAID_WELCOME_STAFF = "3003135941649408838";
const znsConfirmBookingTemplate = async ({ phone, templateConfig }) => {
  try {
    const response = await axios({
      url: ZNS_URL,
      method: "POST",
      data: {
        ApiKey: process.env.SMS_API_KEY,
        SecretKey: process.env.SMS_SECRECT_KEY,
        Phone: phone,
        Params: templateConfig, //theo thứ tư[Tên KH,Tỉnh thành chi nhánh,Thời gian,BookingId,Ghi chú,Địa chỉ chi nhánh,BookingLink]
        TempID: "249881",
        OAID: OAID_CONFIRM_BOOKING,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw Error(error);
  }
};
const znsWelcomeStaffTemplate = async ({ phone, templateConfig }) => {
  try {
    const response = await axios({
      url: ZNS_URL,
      method: "POST",
      data: {
        ApiKey: process.env.SMS_API_KEY,
        SecretKey: process.env.SMS_SECRECT_KEY,
        Phone: phone,
        Params: templateConfig, //theo thứ tư[Tên KH,Tỉnh thành chi nhánh,Thời gian,BookingId,Ghi chú,Địa chỉ chi nhánh,BookingLink]
        TempID: "249919",
        OAID: OAID_WELCOME_STAFF,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw Error(error);
  }
};
module.exports = { znsConfirmBookingTemplate, znsWelcomeStaffTemplate };
