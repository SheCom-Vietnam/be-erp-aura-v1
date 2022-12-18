const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const supabase = require("../config/supabase");
const CLINICS = [
  "Ba Tháng Hai",
  "Phú Yên",
  "Đồng Tháp",
  "Cà Mau",
  "Rạch Giá",
  "Long Xuyên",
  "Vĩnh Long",
  "Cần Thơ",
  "Chưa xác định",
];
class PancakeController {
  _checkAPIKey = (key) => {
    return process.env.X_API_KEY === key;
  };
  hookCustomer = catchAsync(async (req, res, next) => {
    const isValidHeader = this._checkAPIKey(req.headers["x-api-key"]);
    if (!isValidHeader) return next(new AppError("Invalid Header", 400));
    const io = res.io;
    const { account, custom_fields } = req.body;
    if (account && custom_fields) {
      const optionsUser = {
        name: account.account_name,
        phone: account.phone_office,
        id: account.sic_code,
        customer_resource: custom_fields.pancake_ticket_name,
        last_update: custom_fields.pancake_updated_time,
        gender: account.gender,
        live_chat: null,
        clinic: null,
      };
      if (CLINICS.includes(custom_fields.pancake_locale_tag)) {
        optionsUser.clinic = custom_fields.pancake_locale_tag;
        optionsUser.live_chat = custom_fields.pancake_assign_tag;
      } else {
        optionsUser.clinic = custom_fields.pancake_assign_tag;
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
        optionsUser.clinic = custom_fields.pancake_locale_tag;
      }
      const { data: user, error: getUserErrror } = await supabase
        .from("users")
        .select("*")
        .match({ phone: account.phone_office, id: account.sic_code });

      if (user.length > 0) {
        if (user[0].clinic === null && optionsUser.clinic) {
          const { data: updatedUser, error } = await supabase
            .from("users")
            .update([{ clinic: optionsUser.clinic }])
            .match({ phone: account.phone_office, id: account.sic_code })
            .select("*")
            .single();
          if (error) {
            console.log(
              `Tạo dữ liệu lỗi. Vui lòng thử lại ${account.phone_office}`
            );
          } else if (updatedUser) {
            io.emit("pancake_hook", updatedUser);
          }
        }
        if (user[0].live_chat === null && optionsUser.live_chat) {
          const { data: updatedUser, error } = await supabase
            .from("users")
            .update([{ live_chat: optionsUser.live_chat }])
            .match({ phone: account.phone_office, id: account.sic_code })
            .select("*")
            .single();
          if (error) {
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
          .select("*")
          .single();
        if (error) {
          console.log(
            `Tạo dữ liệu lỗi. Vui lòng thử lại ${account.phone_office}`
          );
        } else if (newUser) {
          io.emit("pancake_hook", newUser);
        }
      }
    }
    return res.status(200).send({
      status: "Success",
    });
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
