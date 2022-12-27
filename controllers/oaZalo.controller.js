const oaZaloServices = require("../services/oaZalo.services");
const catchAsync = require("../helpers/catchAsync");
const moment = require("moment");
class OAZaloController {
  _checkTimeAccessToken = (time) => {
    const _time = moment(time).add(1, "days");
    const isValidate = !moment(Date.now()).isAfter(_time); //if date.now is after _time of token (>24h) is invalid
    return isValidate;
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
      console.log(e);
    }
  };
  getAccessToken = catchAsync(async (req, res) => {
    let _token = await oaZaloServices.getTokenOnDb();
    const isValidToken = this._checkTimeAccessToken(_token.time);
    console.log(isValidToken);
    if (!isValidToken) {
      const token = await oaZaloServices.reNewOaToken(_token.refresh_token);
      _token = { ..._token, ...token };
      await oaZaloServices.updateNewOaTokenOnDb(_token);
      return res.status(200).send({
        status: "200",
        data: token,
      });
    }
    return res.status(200).send({
      status: "200",
      data: _token,
    });
  });
  znsCallback = catchAsync(async (req, res) => {
    const { event_name } = req.body;
    console.log(req.body);
    if (event_name === "user_received_message") {
      console.log(req.body);
    }
    return res.status(200).send({
      status: "200",
    });
  });
}
module.exports = new OAZaloController();
