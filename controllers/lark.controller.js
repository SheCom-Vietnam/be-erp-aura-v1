const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const larkServices = require("../services/lark.services");

const axios = require("axios");
const { response } = require("express");

const AURAEVENTBOT = {
  appId: "cli_a361a3bc4939d00a",
  appSecret: "u2Q2FTc0Ma7yrS1OvBUBPctL5VMyhqem",
};
const TrongBot = {
  appId: "cli_a5a7dbb6c7b8900a",
  appSecret: "C2lqihSH0qsdeFk67hvMNhFpyOz7u3mP",
};

const AURAATTENDANCEBOT = {
  appId: "cli_a4987ffe8e78d010",
  appSecret: "fb6T4NaJ4FFN88IUIlYw6cFsCoLiOuqP",
};

class LarkController {
  getTenantToken = catchAsync(async (req, res, next) => {
    const { infoApp } = req.body;
    const data = JSON.stringify({
      app_id: infoApp.app_id,
      app_secret: infoApp.app_secret,
    });
    const config = {
      method: "POST",
      url: "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
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
    if (!tableData) return next(new AppError("Không có dữ liệu để thêm", 400));
    let token = await larkServices.tenantToken(
      AURAEVENTBOT.appId,
      AURAEVENTBOT.appSecret
    ); //key của bot aura event been group Metastream
    let data = { fields: tableData };
    let config = {
      method: "POST",
      url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${tableInfo.app_token}/tables/${tableInfo.table_id}/records?user_id_type=open_id`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    const response = await axios(config);
    console.log(response.data.data);
    if (response.data.data) {
      return res.status(200).send({
        status: "Success",
      });
    } else {
      return next(new AppError("Không thêm được record", 400));
    }
  });
  createARecordByTrongBot = catchAsync(async (req, res, next) => {
    const { tableData, tableInfo } = req.body;
    if (!tableData) return next(new AppError("Không có dữ liệu để thêm", 400));
    let token = await larkServices.tenantToken(
      TrongBot.appId,
      TrongBot.appSecret
    ); //key của Accout Trong
    let data = { fields: tableData };
    console.log("tableData", tableData);
    console.log("tableInfo", tableInfo);

    let config = {
      method: "POST",
      url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${tableInfo.app_token}/tables/${tableInfo.table_id}/records?user_id_type=open_id`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    const response = await axios(config);
    console.log(response.data.data);
    if (response.data.data) {
      return res.status(200).send({
        status: "Success",
      });
    } else {
      return next(new AppError("Không thêm được record", 400));
    }
  });
  sendMessage = catchAsync(async (req, res, next) => {
    const { phone, name, address, service, chatId } = req.body;
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

    let token = await larkServices.tenantToken(
      AURAEVENTBOT.appId,
      AURAEVENTBOT.appSecret
    );
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
    console.log(response.data);
    if (response.data.data) {
      return res.status(200).send({
        status: "Success",
      });
    } else {
      return next(new AppError("Không gửi được tin nhắn", 400));
    }
  });

  getRecordsAttendanceOfUser = catchAsync(async (req, res, next) => {
    //     {
    //     "email":"vothanhduy689@gmail.com",
    //     "phone":"",
    //     "dateFrom":20230201,
    //     "dateTo":20230301
    //    }

    const { email, phone, dateFrom, dateTo } = req.body;

    let accountName = email ? email : phone;
    let token = await larkServices.tenantToken(
      AURAATTENDANCEBOT.appId,
      AURAATTENDANCEBOT.appSecret
    );

    const userId = await larkServices.getUserIdWithPhoneOrEmail(
      accountName,
      token
    );
    var data = JSON.stringify({
      user_ids: [userId],
      check_date_from: dateFrom,
      check_date_to: dateTo,
    });

    var config = {
      method: "POST",
      url: "https://open.larksuite.com/open-apis/attendance/v1/user_tasks/query?employee_type=employee_id",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };
    const response = await axios(config);
    if (response.data.data) {
      console.log(response.data);
      return res.status(200).send({
        status: "Success",
        data: response.data.data.user_task_results,
      });
    } else {
      return next(new AppError("Không có bản ghi", 400));
    }
  });

  eventAttendanceBot = catchAsync(async (req, res, next) => {
    console.log("================================================");
    console.log("eventAttendanceBot body", req.body);
    console.log("================================================");

    const challenge = await larkServices.handleVerificationRequest(req.body);
    console.log("challenge", challenge);
    return res.status(200).send({
      status: "Success",
      challenge: challenge,
    });
  });
}

module.exports = new LarkController();
