const oaZaloServices = require('../services/oaZalo.services')

let openApiMessage = async (req, res) => {
    try {
        let _token = await oaZaloServices.getTokenOnDb()
        const flagTime= oaZaloServices.checkTimeOaToken(_token.time)
    //Nếu quá 25h thì gọi api cấp lại
    if (!flagTime) {
        const token = await oaZaloServices.reNewOaToken(_token.refresh_token)
        _token = { ..._token, ...token }
       await oaZaloServices.updateNewOaTokenOnDb(_token)
    }
        await oaZaloServices.oaSendMessage(_token.access_token, req.params._zalo, req.params._mess)
         return res.status(200).send({
        status: "200"
      });
    } catch (e) {
        console.log(e)
    }
};
module.exports = {
    openApiMessage,
}