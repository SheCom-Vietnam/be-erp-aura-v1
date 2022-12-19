const axios = require("axios").default;
const md5 = require("md5");
const ErrorCode = require("../constant/ErrorCode");
const supabase = require("../config/supabase");
const Private = {
  paymeUrl: process.env.PAYME_DOMAIN,
  xApiClient: process.env.PAYME_API_CLIENT_KEY, // key x-api-client
  secretKey: process.env.PAYME_SECRET_KEY, // key x-api-validate
};

async function createPaymentWeb(payload = {}, authorization = "") {
  const path = "/payment/web";
  const method = "POST";

  const headers = {
    authorization,
    "x-api-client": Private.xApiClient,
    "x-api-validate": md5(
      `${path}${method}${authorization}${JSON.stringify(payload)}${
        Private.secretKey
      }`
    ),
  };

  try {
    const response = await axios.post(`${Private.paymeUrl}${path}`, payload, {
      headers,
    });

    const result = response.data;

    if (result.code === ErrorCode.CREATE_PAYMENT_SUCCEEDED) {
      console.log(
        "Create PaymentWeb sucessfully: ",
        JSON.stringify(result.data)
      );
    } else {
      console.log("Create PaymentWeb failed: ", JSON.stringify(result.message));
    }
  } catch (error) {
    throw error;
  }
}

async function createPaymentQR(payload = {}, authorization = "") {
  const path = "/payment/direct";
  const method = "POST";
  const xApiValidate = md5(
    `${path}${method}${authorization}${JSON.stringify(payload)}${
      Private.secretKey
    }`
  );
  const headers = {
    authorization,
    "x-api-client": Private.xApiClient,
    "x-api-validate": xApiValidate,
  };

  // console.log(Private);
  try {
    const response = await axios.post(`${Private.paymeUrl}${path}`, payload, {
      headers,
    });
    const result = response.data;
    if (result.code === ErrorCode.CREATE_PAYMENT_SUCCEEDED) {
      return result.data;
    } else {
      return result;
    }
  } catch (error) {
    throw error;
  }
}

async function query(payload = {}, authorization = "") {
  const path = "/payment/query";
  const method = "POST";
  const headers = {
    authorization,
    "x-api-client": Private.xApiClient,
    "x-api-validate": md5(
      `${path}${method}${authorization}${JSON.stringify(payload)}${
        Private.secretKey
      }`
    ),
  };

  try {
    const response = await axios.post(`${Private.paymeUrl}${path}`, payload, {
      headers,
    });

    const result = response.data;

    if (result.code === ErrorCode.QUERY_ORDER_SUCCEEDED) {
      console.log("Query sucessfully: ", JSON.stringify(result.data));
    } else {
      console.log("Query failed: ", JSON.stringify(result.message));
    }
  } catch (error) {
    throw error;
  }
}

async function refund(payload = {}, authorization = "") {
  const path = "/payment/refund";
  const method = "POST";

  const headers = {
    authorization,
    "x-api-client": Private.xApiClient,
    "x-api-validate": md5(
      `${path}${method}${authorization}${JSON.stringify(payload)}${
        Private.secretKey
      }`
    ),
  };

  try {
    const response = await axios.post(`${Private.paymeUrl}${path}`, payload, {
      headers,
    });

    const result = response.data;

    if (result.code === ErrorCode.REFUND_ORDER_SUCCEEDED) {
      console.log("Refund sucessfully: ", JSON.stringify(result.data));
    } else {
      console.log("Refund failed: ", JSON.stringify(result.message));
    }
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createPaymentWeb,
  createPaymentQR,
  query,
  refund,
};
