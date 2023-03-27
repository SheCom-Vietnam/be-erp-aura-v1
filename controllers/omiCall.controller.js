const omiCallServices = require("../services/omiCall.services");
const vngStorageServices = require("../services/vngStorage.services");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const supabase = require("../config/supabase");
const axios = require("axios");
const moment = require("moment");
const { OmiCallWhiteList } = require("../constant/omiCallWhitelist");
class OmiCallController {
  _getAccessToken = async () => {
    try {
      const getToken = await omiCallServices.getOmiTokenOnDb();

      //if dont'have record insert new record
      if (!getToken) {
        const response = await omiCallServices.getOmilAccesKey();
        if (response.data.status_code === 9999) {
          const newToken = await omiCallServices.insertOmiTokenOnDB({
            access_token: response.data.payload.access_token,
            access_type: response.data.payload.access_type,
            token_type: response.data.payload.token_type,
          });
          return newToken;
        }
      }
      //if invalid token call new token and update in db
      if (!omiCallServices.checkTimeAccessToken(getToken.time)) {
        const response = await omiCallServices.getOmilAccesKey();

        if (response.data.status_code === 9999) {
          const updatedToken = await omiCallServices.updateOmiTokenOnDB(
            getToken.id,
            {
              access_token: response.data.payload.access_token,
              access_type: response.data.payload.access_type,
              token_type: response.data.payload.token_type,
            }
          );
          return updatedToken;
        }
      } else {
        //if valid token return
        return getToken;
      }
    } catch (error) {
      throw error;
    }
  };
  _uploadAudio = async (file) => {
    const accessKey = await vngStorageServices.getAccessKey();
    const fileName = `${moment().format(
      "DD-MM-YYYY"
    )}-${file.originalname.replace("wav", "mp3")}`;
    try {
      const response = await axios({
        method: "PUT",
        url: `${process.env.STORAGE_URL}/${fileName}`,
        data: file.buffer,
        headers: {
          "Content-Type": file.mimetype,
          "X-Auth-Token": accessKey.access_token,
        },
      });
      if (response && response.status === 201) {
        return `${process.env.STORAGE_URL}/${fileName}`;
      } else {
        return null;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  checkOmiCallEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const { access_token } = await this._getAccessToken();
    const { payload } = await omiCallServices.getInternalPhoneList(
      access_token
    );
    if (!payload) return next(new AppError("Can not get omi phone list", 500));
    const staffInfo = payload.items.find((item) => item.email === email);
    if (!staffInfo) {
      return next(new AppError("Can not find user belong with email", 400));
    }
    return res.status(200).send({
      status: "Success",
      data: staffInfo.email,
    });
  });
  getOmiInfo = catchAsync(async (req, res, next) => {
    const { email } = req.query;
    if (!email) {
      return next(new AppError("Missing email in query", 400));
    }
    // this._getAccessToken() return {
    // id: 'a3ba9384-d9a6-41f9-9df6-69e969f81876',
    // created_at:
    // access_token:
    // access_type:
    // token_type
    //}
    const { access_token } = await this._getAccessToken();
    const { payload } = await omiCallServices.getInternalPhoneList(
      access_token
    );
    const staffInfo = payload.items.find((item) => item.email === email);
    if (!staffInfo) {
      return next(new AppError("Can not find user belong with email", 400));
    }
    const { data, error } = await supabase
      .from("staffs")
      .update({ omi_sip_number: staffInfo.sip_user })
      .match({ omi_call_email: email });
    if (error) {
      return next(new AppError("Can not update staff info", 500));
    }
    return res.status(200).send({
      status: "Success",
      data: {
        domain: staffInfo.domain,
        sip_user: staffInfo.sip_user,
        password: staffInfo.password,
      },
    });
  });
  webhook = catchAsync(async (req, res, next) => {
    if (req.headers["x_api_key"] !== process.env.OMI_KEY) {
      return next(new AppError("Unauthorized", 401));
    }
    res.status(200).send("Success");
    if (req.file) {
      const file = req.file;
      console.log(req.file.originalname);
      const callUuid = req.file.originalname.split(".")[0];
      const audioStorageUrl = await this._uploadAudio(file);
      if (!audioStorageUrl) {
        console.log("Storage Audio File Error");
      } else {
        const { data: omicall } = await supabase
          .from("omi_calls")
          .upsert(
            {
              id: callUuid,
              record_file: audioStorageUrl,
            },
            { onConflict: "id" }
          )
          .select("*")
          .single();
        if (omicall) console.log("Attach Audio file OmiCall ", omicall.id);
      }
    } else {
      const {
        call_uuid, //call uuid
        created_date, //ngay tao
        record_seconds,
        recording_file, // file record (k cần nữa)
        call_out_price, //gia tien
        to_number, //sdt khach hang
        sip_user,
        disposition, //"cancelled" || "answered"
        provider,
        source_number, // from phone
      } = req.body;
      let { data: staff } = await supabase
        .from("staffs")
        .select("*")
        .eq("omi_sip_number", sip_user)
        .single();
      const { data: omicall } = await supabase
        .from("omi_calls")
        .upsert(
          {
            id: call_uuid,
            staff_id: staff?.id || null,
            created_date: created_date,
            record_file: recording_file,
            price: Math.round(call_out_price) || 0,
            record_seconds: record_seconds,
            customer_phone: to_number,
            customer_phone_provider: provider,
            from_phone: source_number,
            disposition: disposition,
          },
          { onConflict: "id" }
        )
        .select("*")
        .single();
      if (omicall) {
        console.log("Create new omicall data success", omicall.id);
      }
    }
  });
}
module.exports = new OmiCallController();
