const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const supabase = require("../config/supabase");
class PancakeController {
  _checkAPIKey = (key) => {
    return process.env.X_API_KEY === key;
  };
  hookCustomer = catchAsync(async (req, res, next) => {
    const isValidHeader = this._checkAPIKey(req.headers["x-api-key"]);
    if (!isValidHeader) return next(new AppError("Invalid Header", 400));
    const io = res.io;
    const { account, custom_fields } = req.body;
    console.log(account);
    // console.log(custom_fields);
    if (account && custom_fields) {
      const { data: newUser, error } = await supabase
        .from("users")
        .upsert([
          {
            name: account.account_name,
            phone: account.phone_office,
            id: account.sic_code,
            customer_resource: custom_fields.pancake_ticket_name,
            last_update: custom_fields.pancake_updated_time,
            gender: account.gender,
            live_chat: custom_fields.pancake_assign_tag,
            clinic: custom_fields.pancake_locale_tag,
          },
        ])
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
