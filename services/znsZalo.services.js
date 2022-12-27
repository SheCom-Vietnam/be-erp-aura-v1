const axios = require("axios");
const ZNS_URL = "https://business.openapi.zalo.me/message/template";
const {
  convertZaloPhoneToPhone,
  convertPhonetoZaloPhone,
} = require("../helpers/convert/convertToVnPhone");
const znsZaloRatingTemplate = async (
  accessKey,
  phone,
  customerName,
  bookingId,
  customerZaloId
) => {
  try {
    const response = await axios({
      url: ZNS_URL,
      method: "POST",
      data: {
        phone: convertPhonetoZaloPhone(phone),
        template_id: "241392",
        template_data: {
          customer_name: customerName,
          booking_id: bookingId,
        },
        tracking_id: customerZaloId,
      },
      headers: {
        "Content-Type": "application/json",
        access_token: accessKey,
      },
    });
    return response;
  } catch (error) {
    console.log("erro");
    return error;
  }
};
module.exports = { znsZaloRatingTemplate };
