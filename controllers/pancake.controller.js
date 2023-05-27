const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const axios = require("axios");
const Queue = require('bee-queue');
const pancakeService = require('../services/pancake.services')

// Khởi tạo hàng đợi
const queue = new Queue('create-user-pancake');

// Đăng ký xử lý công việc
queue.process(async function (job) {
  const requestBody = job.data;
  // Xử lý công việc
  await pancakeService.handleHook(requestBody)
});

const CLINICS = [
  "Ba Tháng Hai",
  "Phú Yên",
  "Đồng Tháp",
  "Cà Mau",
  "Rạch Gía",
  "Long Xuyên",
  "Vĩnh Long",
  "Cần Thơ",
  "Mỹ Tho",
  "Vinh",
];
class PancakeController {
  _checkAPIKey = (key) => {
    return process.env.X_API_KEY === key;
  };
  checkPancakeName = catchAsync(async (req, res, next) => {
    const { pancakeName } = req.body;
    if (!pancakeName) return next(new AppError("Missing data in body", 400));
    const response = await axios.get(
      `https://pages.fm/api/public_api/v1/pages/${process.env.PANCAKE_PAGE_ID}/tags?access_token=${process.env.PANCAKE_PAGE_ACCESS_KEY}`
    );
    if (response && response.status === 200) {
      const listTags = response.data.tags;
      const findPancakeName = listTags.find(
        (item) => item.text === pancakeName
      );
      console.log(findPancakeName);
      if (!findPancakeName || CLINICS.includes(pancakeName)) {
        return next(
          new AppError("Can not find user belong with username", 400)
        );
      }
      return res.status(200).send({
        status: "Success",
        data: findPancakeName,
      });
    }
  });


  // https://api-staging.auradental.vn/api/v1/pancake/hook
  hookCustomer = catchAsync(async (req, res, next) => {
    const isValidHeader = this._checkAPIKey(req.headers["x-api-key"]);
    if (!isValidHeader) return next(new AppError("Invalid Header", 400));
    res.status(200).send({
      status: "Success",
    });
    const { account, custom_fields } = req.body;
    console.log("==============================================")
    console.log("account",account)
    console.log("custom_fields", custom_fields)
    console.log("==============================================")

    // console.log(custom_fields);
    //     {
    //   account_name: 'Thanh Sơn Nguyễn',
    //   gender: 'male',
    //   phone_office: '0933670101',
    //   sic_code: 'a973d8c1-aae4-4b62-a512-c5e072fb4099'
    // } {
    //   pancake_assign_tag: 'Hương',
    //   pancake_locale_tag: 'Ba Tháng Hai',
    //   pancake_service_tag: '',
    //   pancake_ticket_name: 'Fanpage',
    //   pancake_updated_time: '11/01/2023'
    // }
    // console.log(account, custom_fields);

    if (!account || !custom_fields) {
      return;
    }
    queue.createJob(req.body).save();
    next();
  });

  testHook = catchAsync(async (req, res, next) => {
    const io = res.io;
    const newUser = {
      id: "c710838d-b770-45f3-bf35-d861fa491af",
      created_at: "2022-12-13T08:22:31.551734+00:00",
      phone: "0933670102",
      avatar: null,
      name: "Thanh Sơn Nguyễn 2",
      zalo_id: null,
      clinic_id: null,
      status: 1,
      details_status: null,
      customer_resource: null,
      interact_type: null,
      interact_result: null,
      live_chat: null,
      last_update: null,
      age: null,
      district: null,
    };

    io.emit("pancake_hook", newUser);
    return res.status(200).send({
      status: "Success",
    });
  });
}

module.exports = new PancakeController();
