const omiCallServices = require("../services/omiCall.services");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");

class OmiCallController {
  _getAccessToken = async () => {
    try {
      const getToken = await omiCallServices.getOmiTokenOnDb();
      //if dont'have record insert new record
      if (getToken.length === 0) {
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
      if (!omiCallServices.checkTimeAccessToken(getToken[0].created_at)) {
        const response = await omiCallServices.getOmilAccesKey(getToken[0].id);
        if (response.data.status_code === 9999) {
          const updatedToken = await omiCallServices.updateOmiTokenOnDB(
            getToken[0].id,
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
        return getToken[0];
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
    console.log(req.body);
    // const response = await axios.get(
    //   "https://public-v1-stg.omicrm.com/third_party/recording/uc?id=UWJ5N2JRdTlHa0NJUzEvZktxTlNDZmVlVEVuMkgzUTZNZWpDTDdsVlZQNnBXZWk4QjZTVWxPTlhiWkhYaDR4VGtQZ003anpsS01rMm9OUFJ0RnVOU2c9PQ=="
    // );
    // console.log(response.data);
  });
}
module.exports = new OmiCallController();
