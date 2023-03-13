const axios = require("axios");
const ZNS_URL =
  "http://rest.esms.vn/MainService.svc/json/SendZaloMessage_V4_post_json/"; //Vihat

const OAID = "1783272961339323129";
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
        TempID: "249693",
        OAID: OAID,
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
module.exports = { znsConfirmBookingTemplate };
