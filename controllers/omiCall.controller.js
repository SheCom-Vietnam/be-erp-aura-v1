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
  getToken = catchAsync(async (req, res, next) => {
    const temp = await this._getAccessToken();
    // console.log(temp);
  });
}
module.exports = new OmiCallController();
