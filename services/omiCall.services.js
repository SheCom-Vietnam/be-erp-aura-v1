const axios = require("axios");
const supabase = require("../config/supabase");
const moment = require("moment");

const checkTimeAccessToken = (time) => {
  const _time = moment(time).add(1, "days");
  const isValid = !moment(new Date(Date.now())).isAfter(new Date(_time)); //if date.now is after _time of token (>24h) is invalid
  return isValid;
};
const getOmilAccesKey = async () => {
  try {
    const response = axios({
      url: `${process.env.OMI_API}/api/auth?apiKey=${process.env.OMI_KEY}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    throw error;
  }
};
const getOmiTokenOnDb = async () => {
  try {
    let { data: omi_token, error } = await supabase
      .from("omi_token")
      .select("*")
      .single();
    if (error) {
      return null;
    } else if (omi_token) {
      return omi_token;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const updateOmiTokenOnDB = async (id, newToken) => {
  try {
    let { data: omi_token, error } = await supabase
      .from("omi_token")
      .update({
        access_token: newToken.access_token,
        access_type: newToken.access_type,
        token_type: newToken.token_type,
        time: Date.now(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      throw new Error(error);
    } else if (omi_token) {
      console.log("update new OmiToken sucesss");
      return omi_token;
    }
  } catch (e) {
    throw new Error(e);
  }
};
const insertOmiTokenOnDB = async (newToken) => {
  try {
    let { data: omi_token, error } = await supabase
      .from("omi_token")
      .insert({
        access_token: newToken.access_token,
        access_type: newToken.access_type,
        token_type: newToken.token_type,
        time: Date.now(),
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error);
    } else if (omi_token) {
      console.log("Insert newOmiToken sucesss");
      return omi_token;
    }
  } catch (e) {
    throw new Error(e);
  }
};
const getInternalPhoneList = async (accessKey) => {
  try {
    const response = await axios({
      url: `${process.env.OMI_API}/api/call_center/internal_phone/list`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessKey}`,
      },
    });
    if (response && response.status === 200) {
      return response.data;
    } else {
      console.log("Get phone list fail");
      return response;
    }
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = {
  getOmilAccesKey,
  updateOmiTokenOnDB,
  getOmiTokenOnDb,
  checkTimeAccessToken,
  insertOmiTokenOnDB,
  getInternalPhoneList,
};
