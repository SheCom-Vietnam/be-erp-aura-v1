const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const supabase = require("../config/supabase");
const axios = require("axios");
const { VnProvinces } = require("../constant/VnProvinces");
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

    console.log(req.body);
    const isValidHeader = this._checkAPIKey(req.headers["x-api-key"]);
    if (!isValidHeader) return next(new AppError("Invalid Header", 400));
    res.status(200).send({
      status: "Success",
    });
    const io = res.io;
    const { account, custom_fields } = req.body;
    console.log(account);
    console.log(custom_fields);
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
    if (account && custom_fields) {
      const optionsUser = {
        name: account.account_name,
        phone: account?.phone_office || null,
        phone_update_date: account?.phone_office ? new Date(Date.now()) : null,
        id: account.sic_code,
        customer_resource: custom_fields.pancake_ticket_name,
        last_update: custom_fields.pancake_updated_time,
        gender: account.gender,
        service_staff: process.env.PANCAKE_SERVICE_STAFF_DEFAULT, //Vũ Ngọc Trường HUy
        status: process.env.PANCAKE_STATUS_DEFAULT, //Mới
        live_chat: "Nhung",
        clinic: null,
      };
      if (CLINICS.includes(custom_fields.pancake_locale_tag)) {
        // optionsUser.clinic = custom_fields.pancake_locale_tag;
        optionsUser.clinic = null;
        optionsUser.live_chat = custom_fields.pancake_assign_tag;
      } else {
        // optionsUser.clinic = custom_fields.pancake_assign_tag;
        optionsUser.clinic = null;
        optionsUser.live_chat = custom_fields.pancake_locale_tag;
      }
      if (
        !CLINICS.includes(custom_fields.pancake_locale_tag) &&
        !CLINICS.includes(custom_fields.pancake_assign_tag)
      ) {
        optionsUser.live_chat = custom_fields.pancake_locale_tag;
        optionsUser.clinic = null;
      }
      if (
        CLINICS.includes(custom_fields.pancake_locale_tag) &&
        CLINICS.includes(custom_fields.pancake_assign_tag)
      ) {
        optionsUser.live_chat = null;
        // optionsUser.clinic = custom_fields.pancake_locale_tag;
        optionsUser.clinic = null;
      }
      const { data: user, error: getUserErrror } = await supabase
        .from("users")
        .select("*")
        .match({ id: account.sic_code });
      if (user.length > 0) {
        if (user[0].phone === null && optionsUser.phone !== null) {
          const { data: updatedUser, error } = await supabase
            .from("users")
            .update([
              {
                phone: optionsUser.phone,
                phone_update_date: optionsUser.phone_update_date,
              },
            ])
            .match({ id: account.sic_code })
            .select("*,service_staff(*)")
            .single();
          if (error) {
            console.log(error);
            console.log(
              `Tạo dữ liệu lỗi. Vui lòng thử lại ${account.phone_office}`
            );
          } else if (updatedUser) {
            io.emit("pancake_hook", updatedUser);
          }
        } else if (user[0].live_chat === null && optionsUser.live_chat) {
          const { data: updatedUser, error } = await supabase
            .from("users")
            .update([{ live_chat: optionsUser.live_chat }])
            .match({ id: account.sic_code })
            .select("*,service_staff(*)")
            .single();
          if (error) {
            console.log(error);
            console.log(
              `Tạo dữ liệu lỗi. Vui lòng thử lại ${account.phone_office}`
            );
          } else if (updatedUser) {
            io.emit("pancake_hook", updatedUser);
          }
        }
      } else {
        const { data: newUser, error } = await supabase
          .from("users")
          .insert([optionsUser])
          .select("*,status(*),service_staff(*)")
          .single();
        if (error) {
          console.log(error);
          console.log(
            `Người dùng đã tồn tại. Vui lòng thử lại ${account.phone_office}`
          );
        } else if (newUser) {
          io.emit("pancake_hook", newUser);
        }
      }
    }
  });
  testHook = catchAsync(async (req, res, next) => {
    const io = res.io;
    const newUser = {
      id: "c710838d-b770-45f3-bf35-d861fa4914ee",
      created_at: "2022-12-13T08:22:31.551734+00:00",
      phone: "0933670101",
      avatar: null,
      name: "Thanh Sơn Nguyễn",
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
