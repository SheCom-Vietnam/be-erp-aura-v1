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
}
module.exports = new LarkController();
