const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const axios = require("axios");
const { VnProvinces } = require("../constant/VnProvinces");
const supabase = require("../config/supabase");

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

  hookCustomer = catchAsync(async (req, res, next) => {
    const isValidHeader = this._checkAPIKey(req.headers["x-api-key"]);
    if (!isValidHeader) return next(new AppError("Invalid Header", 400));

    res.status(200).send({
      status: "Success",
    });
    
    const io = res.io;
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
    
    const optionsUser = {
        name: account?.account_name.trim(),
        avatar: custom_fields?.psid && custom_fields?.page_id? `https://pancake.vn/api/v1/pages/${custom_fields?.page_id}/avatar/${custom_fields?.psid}`: null,
        phone:account?.phone_office? account.phone_office.trim() : null,
        phone_update_date: account?.phone_office ? new Date(Date.now()) : null,
        id: account.sic_code,
        customer_resource: custom_fields.pancake_ticket_name,
        last_update: custom_fields.pancake_updated_time,
        gender: account.gender,
        service_staff: process.env.PANCAKE_SERVICE_STAFF_DEFAULT, //Vũ Ngọc Trường HUy
        status: process.env.PANCAKE_STATUS_DEFAULT, //Mới
        live_chat: null,
        clinic: null,
    };

    if (CLINICS.includes(custom_fields.pancake_locale_tag)) {
        optionsUser.clinic = null;
        optionsUser.live_chat = custom_fields.pancake_assign_tag;
    } else {
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
        optionsUser.clinic = null;
    }

    console.log("==============================================")
    console.log("optionsUser",optionsUser)
    console.log("==============================================")

    let checkHaveUser = false
    let _userInfoForSicCode = null
    let _userInfoForPhone = null

    const { data: userForSicCode} = await supabase //Tìm user theo sic_code
      .from("users")
      .select("id,phone,live_chat,name")
      .eq("id", account.sic_code);
    
    if (userForSicCode && userForSicCode.length > 0) {
      checkHaveUser = true
      _userInfoForSicCode = userForSicCode
    }
    
    if (optionsUser.phone !== null) { 
      const { data: userForPhone} = await supabase //Tìm user theo phone
        .from("users")
        .select("id,phone,live_chat,name")
        .eq("phone", optionsUser.phone);
      
      if (userForPhone && userForPhone.length > 0) {
        checkHaveUser = true
        _userInfoForPhone = userForPhone
      }
    }

    if (_userInfoForPhone && _userInfoForSicCode) {
      //Nếu id của 2 record khác nhau thì xoá cái vừa tạo đi
      if ((_userInfoForPhone[0].id !== _userInfoForSicCode[0].id) && (_userInfoForPhone[0].name == _userInfoForSicCode[0].name)) {
         const { error} = await supabase
        .from("users")
        .delete()
        .eq("id", _userInfoForSicCode[0].id);
        if (error) {
          console.log(error)
        } 
        _userInfoForSicCode = _userInfoForPhone
      }
    }
    
    if (!checkHaveUser) {
      //Không có User thì tạo mới user
      const { data: newUser,error} = await supabase
        .from("users")
        .insert([optionsUser])
        .select("*,status(*),service_staff(*)")
        .single();
      
    console.log("==============================================")
    console.log("newUser",newUser)
    console.log("error",error)
    console.log("==============================================")

      
      if (newUser) {
        io.emit("pancake_hook", newUser);
      }
      else if (error) {
        console.log(error)
      }
    }
      
    if (optionsUser.phone !== null && _userInfoForSicCode[0].phone !== optionsUser.phone) {
      //Update phone for user
      const { data: updatedPhoneUser, error } = await supabase
        .from("users")
        .update([
            {
              phone: optionsUser.phone.trim(),
              phone_update_date: optionsUser.phone_update_date,
            },
          ])
        .eq("id",_userInfoForSicCode[0].id )
        .select("*,status(*),service_staff(*)")
        .single();
      
        if (error) {
          console.log(error);
        }
        else if (updatedPhoneUser) {
          io.emit("pancake_hook", updatedPhoneUser);
        }
    }

      if (optionsUser.avatar !== null && _userInfoForSicCode[0].avatar !== optionsUser.avatar) {
      //Update avatar for user
      const { data: updatedPhoneUser, error } = await supabase
        .from("users")
        .update([
            {
              avatar: optionsUser.avatar.trim()
            },
          ])
        .eq("id",_userInfoForSicCode[0].id )
        .select("*,status(*),service_staff(*)")
        .single();
      
        if (error) {
          console.log(error);
        }
        else if (updatedPhoneUser) {
          io.emit("pancake_hook", updatedPhoneUser);
        }
  }
  
   if (optionsUser.name !== null && _userInfoForSicCode[0].name !== optionsUser.name) {
      //Update avatar for user
      const { data: updatedPhoneUser, error } = await supabase
        .from("users")
        .update([
            {
              name: optionsUser.name.trim()
            },
          ])
        .eq("id",_userInfoForSicCode[0].id )
        .select("*,status(*),service_staff(*)")
        .single();
      
        if (error) {
          console.log(error);
        }
        else if (updatedPhoneUser) {
          io.emit("pancake_hook", updatedPhoneUser);
        }
    }

    if (optionsUser.live_chat && _userInfoForSicCode[0].live_chat !== optionsUser.live_chat) {
      //Update live_chat for user
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update([{ live_chat: optionsUser.live_chat }])
        .id( "id",account.sic_code )
        .select("*,status(*),service_staff(*)")
        .single();
      
      if (updatedUser) {
            io.emit("pancake_hook", updatedUser);
      } else if (error) {
          console.log(error);
      }  
    }
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
      data: newUser
    });
  });
}

module.exports = new PancakeController();
