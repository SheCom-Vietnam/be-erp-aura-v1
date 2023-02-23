const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const larkServices = require("../services/lark.services");

const axios = require("axios");
const { response } = require("express");

class LarkController {
    getTenantToken = catchAsync(async (req, res, next) => {
        const {infoApp} = req.body;
    const data = JSON.stringify({
        "app_id": infoApp.app_id,
        "app_secret": infoApp.app_secret
    });
    const config = {
        method: 'POST',
        url: 'https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };
      const token = await axios(config);
    if (token) {
      return res.status(200).send({
        status: "Success",
        data: token.data,
      });
    } else {
      return next(new AppError("Không có token", 400));
    }
  });
    
    
createARecord = catchAsync(async (req, res, next) => {
    const { tableData, tableInfo } = req.body;
    if(!tableData) return next(new AppError("Không có dữ liệu để thêm", 400));
    if(!tableData) return next(new AppError("Không có tin bảng dữ liệu", 400));
    console.log("====================req.body====================")
    console.log(req.body)
    console.log("================================================")
    let token = await larkServices.tenantToken()
    let data = { fields: tableData  }
    let config = {
        method: 'POST',
        url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${tableInfo.app_token}/tables/${tableInfo.table_id}/records?user_id_type=open_id`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data : data
    };

    const response = await axios(config);
    console.log(response.data.data)
    if (response.data.data) {
        return res.status(200).send({
        status: "Success",
    });
    } else {
        return next(new AppError("Không thêm được record", 400));
    }
});
  
  
  sendMessage = catchAsync(async (req, res, next) => {
    const { phone, name, address, service,chatId} = req.body;
    console.log("====================req.body====================")
    console.log(req.body)
    console.log("================================================")

    const a = {
        en_us: {
          title: "Aura Bot 🤖",
          content: [
            [
              {
                tag: "text",
                text: "📱 SĐT:                👤 Khách hàng:",
              },
            ],
            [
              {
                tag: "text",
                text: ` ${phone}      ${name}`,
              },
            ],
            [
              {
                tag: "text",
                text: "",
              },
            ],
            [
              {
                tag: "text",
                text: `🏠 ĐC: ${address}`,
              },
            ],
            [
              {
                tag: "text",
                text: "",
              },
            ],
              [
              {
                tag: "text",
                text: `🛅 Dịch vụ: ${service}`,
              },
            ],
          ],
        },
      };

    let token = await larkServices.tenantToken()
    const config = {
        url: "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id",
        method: "POST",
        data: {
            receive_id: chatId,
            content: JSON.stringify(a),
            msg_type: "post",
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
      };
    const response = await axios(config);
    console.log(response.data)
    if (response.data.data) {
        return res.status(200).send({
        status: "Success",
    });
    } else {
        return next(new AppError("Không gửi được tin nhắn", 400));
    }
  });
}
module.exports = new LarkController();
