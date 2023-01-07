const omiCallServices = require("../services/omiCall.services");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const supabase = require("../config/supabase");
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
      if (!omiCallServices.checkTimeAccessToken(getToken.created_at)) {
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
      .match({ email: email, role: "staff" });
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
    res.status(200).send("Sucess");
    const {
      created_date, //ngay tao
      record_seconds,
      recording_file,
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
    if (staff) {
      const { data: omicall } = await supabase
        .from("omi_calls")
        .insert({
          staff_id: staff.id,
          created_date: created_date,
          price: Math.round(call_out_price) | 0,
          record_seconds: record_seconds,
          record_file: recording_file,
          customer_phone: to_number,
          customer_phone_provider: provider,
          from_phone: source_number,
          disposition: disposition,
        })
        .select("*")
        .single();
      if (omicall) {
        console.log(omicall);
        console.log("Create new omicall data success", omicall.id);
      }
    }
  });
}
module.exports = new OmiCallController();
