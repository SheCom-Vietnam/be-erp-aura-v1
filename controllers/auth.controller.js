const catchAsync = require("../helpers/catchAsync");
const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");
const AppError = require("../helpers/appError");
const jwt = require("jsonwebtoken");
const {
  sendSignUpMail,
  sendRecoveryPass,
} = require("../services/sendMail.service");
class AuthController {
  initPassword = catchAsync(async (req, res) => {
    const hashedPassword = await bcrypt.hash("123456", 12);
    console.log(hashedPassword);
    // const temp = await bcrypt.compare(
    //   "123456",
    //   "$2b$12$U.YbuuBQCyVcmWkvPBDiI.t/0p.60US1vOzDUtJMdy3RoGhGj639a"
    // );
    // console.log(temp);
  });
  signToken = (phone) => {
    if (process.env.JWT_TOKEN_SECRET && process.env.JWT_EXPIRES_IN) {
      return jwt.sign({ id: phone }, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
    }
  };
  loginWithPhone = catchAsync(async (req, res, next) => {
    const { phone, password } = req.body;
    const { data: staffAuth, error: staffAuthError } = await supabase
      .from("staffs")
      .select("*")
      .match({ phone: phone });
    console.log(staffAuthError);
    if (staffAuthError) {
      return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 500));
    }
    if (staffAuth && staffAuth.length === 0) {
      return next(new AppError("Không tìm thấy người dùng", 400));
    }
    if (await bcrypt.compare(password, staffAuth[0].password)) {
      // if (staffAuth.active === false) {
      //   return next(new AppError("Người dùng bị vô hiệu hoá", 400));
      // }
      let { data: staffInfo, error } = await supabase
        .rpc("get_staff_info_by_phone", {
          staff_phone: staffAuth[0].phone,
        })
        .single();
      if (error) {
        return next(new AppError("Không tìm thấy thông tin người dùng", 400));
      }

      if (staffInfo.clinics === null || staffInfo.roles === null) {
        return next(new AppError("Chưa cập nhật đủ thông tin", 400));
      }
      const token = this.signToken(staffAuth[0].phone);
      return res.status(200).send({
        status: "Success",
        data: staffInfo,
        token: token,
      });
    } else {
      return next(new AppError("Sai mật khẩu", 400));
    }
  });

    staffLoginWithPhone = catchAsync(async (req, res, next) => {
    const { phone, password } = req.body;
    const { data: staffAuth, error: staffAuthError } = await supabase
      .from("staffs")
      .select("*")
      .match({ phone: phone });
    console.log(staffAuthError);
    if (staffAuthError) {
      return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 500));
    }
    if (staffAuth && staffAuth.length === 0) {
      return next(new AppError("Không tìm thấy người dùng", 400));
    }
    if (await bcrypt.compare(password, staffAuth[0].password)) {
      if (staffAuth.active === false) {
        return next(new AppError("Người dùng bị vô hiệu hoá", 400));
      }
      let { data: staffInfo, error } = await supabase
        .rpc("get_staff_info_by_phone", {
          staff_phone: staffAuth[0].phone,
        })
        .single();
      if (error) {
        return next(new AppError("Không tìm thấy thông tin người dùng", 400));
      }

      if (staffInfo.roles === null) {
        return next(new AppError("Chưa cập nhật đủ thông tin", 400));
      }
      let check = staffInfo.roles.some(item => item.tag === "reception");
      console.log(check);
       if (!check) {
        return next(new AppError("Không có quyền truy cập", 400));
      }
      return res.status(200).send({
        status: "Success",
        data: staffInfo,
      });
    } else {
      return next(new AppError("Sai mật khẩu", 400));
    }
  });

  loginWithPhoneForDoctor = catchAsync(async (req, res, next) => {
    const { phone, password } = req.body;

    const { data, error } = await supabase
      .from("staffs")
      .select("*,clinic_id(*)")
      .match({ phone: phone, role: "doctor" });

    if (error) {
      return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 500));
    }
    if (data && data.length === 0) {
      return next(new AppError("Không tìm thấy người dùng", 400));
    }
    if (await bcrypt.compare(password, data[0].password)) {
      if (data[0].verify === false) {
        return next(new AppError("Người dùng chưa được xác thực", 400));
      }

      const token = this.signToken(data[0].phone);
      return res.status(200).send({
        status: "Success",
        data: data[0],
        token: token,
      });
    } else {
      return next(new AppError("Sai mật khẩu", 400));
    }
  });

  updatePassword = catchAsync(async (req, res, next) => {
    const { phone, oldPassword, newPassword } = req.body;
    const { data, error } = await supabase
      .from("staffs")
      .select("*")
      .match({ phone: phone });
    if (error) {
      return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 500));
    }
    if (data && data.length === 0) {
      return next(new AppError("Không tìm thấy người dùng phù hợp", 400));
    }
    if (await bcrypt.compare(oldPassword, data[0].password)) {
      const newhashedPassword = await bcrypt.hash(newPassword, 12);
      const { data: newUpdatedPassRole, error: newUpdatedPassError } =
        await supabase
          .from("staffs")
          .update({ password: newhashedPassword })
          .eq("id", data[0].id)
          .select("*")
          .single();
      if (newUpdatedPassError) {
        return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 500));
      }
      if (newUpdatedPassRole) {
        const token = this.signToken(data[0].phone);
        return res.status(200).send({
          status: "Success",
          token: token,
        });
      }
    } else {
      return next(new AppError("Mật khẩu cũ không đúng. Thử lại", 400));
    }
  });
  getInfo = async (req, res, next) => {
    let { data: staffInfo, error: staffError } = await supabase
      .rpc("get_staff_info_by_phone", {
        staff_phone: req.user.phone,
      })
      .single();
    if (staffInfo.clinics === null || staffInfo.roles === null) {
      return next(new AppError("Chưa cập nhật đủ thông tin", 400));
    }
    if (staffError) {
      return next(new AppError("Có lỗi xảy ra. Vui lòng thử lại", 400));
    } else if (staffInfo) {
      return res.status(200).send({
        status: "Success",
        data: staffInfo,
      });
    }
  };
  signUpEmail = catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return next(new AppError("Missing value in body", 400));
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      password: password,
      options: {
        data: {
          user_name: username,
        },
      },
    });
    if (!error) {
      const toEmail = data.user.email;
      const toUserName = data.user.user_metadata.user_name;
      const confirmationToken = data.properties.action_link;
      const sendMail = await sendSignUpMail(
        toEmail,
        toUserName,
        confirmationToken
      );
      if (sendMail && sendMail.statusCode === 202) {
        return res.status(200).send({
          status: "Success",
        });
      } else {
        return res.status(404).send({
          status: "Failed",
        });
      }
    } else {
      return next(new AppError(error.message, 400));
    }
  });
  forgotPassEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError("Missing value in body", 400));
    //check email exsist in db
    const { data: checkEmail } = await supabase
      .from("admin")
      .select(`id`)
      .eq("email", email);
    if (checkEmail) {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
      });
      if (!error) {
        const toEmail = data.user.email;
        const toUserName = data.user.user_metadata.user_name;
        const recoveryUrl = data.properties.action_link;
        const sendMail = await sendRecoveryPass(
          toEmail,
          toUserName,
          recoveryUrl
        );
        if (sendMail && sendMail.statusCode === 202) {
          return res.status(200).send({
            status: "Success",
          });
        } else {
          return res.status(404).send({
            status: "Failed",
          });
        }
      }
    } else {
      return next(new AppError("Do not have user belong with this email", 400));
    }
  });
}
module.exports = new AuthController();
