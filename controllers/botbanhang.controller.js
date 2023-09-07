const catchAsync = require("../helpers/catchAsync");
const supabase = require("../config/supabase");

class BotbanhangController {
  getFormValue = catchAsync(async (req, res, next) => {
    const response = await Promise.all([
      supabase.from("advertises").select("*").match({ active: true }),
      supabase.from("categories").select("*").match({ active: true }),
      supabase
        .from("customer_resources")
        .select("*")
        .match({ label: "Mạng xã hội" }),
      supabase.from("agencies").select("*").eq("active", true),
      supabase.from("staffs").select("*"),
      supabase.from("customer_status").select("id,name,type,parent_id").match({
        type: "details_status",
        active: true,
      }),
      supabase.from("customer_status").select("id,name,type,parent_id").match({
        type: "status",
        active: true,
      }),
      supabase.from("customer_status").select("id,name,type,parent_id").match({
        type: "interact_type",
        active: true,
      }),
      supabase.from("customer_status").select("id,name,type,parent_id").match({
        type: "interact_result",
        active: true,
      }),
      supabase.from("clinics").select("*").match({
        active: true,
      }),
    ]);
    if (response) {
      return res.status(200).send({
        status: "OK",
        data: response.map((_) => _.data),
      });
    }
    return res.status(500).send({
      status: "error",
    });
  });

  getUserInfo = catchAsync(async (req, res, next) => {
    const { phone, fb_client_id } = req.body;
    const { data: _user } = await supabase
      .from("users")
      .select("*")
      .or(`phone.eq.${phone},fb_client_id.eq.${fb_client_id}`)
      .single();
    if (_user) {
      return res.status(200).send({
        status: "OK",
        data: _user,
      });
    }
    return res.status(203).send({
      status: "not found",
    });
  });

  addUserInfo = catchAsync(async (req, res, nexxt) => {
    const {
      fb_name,
      name,
      phone,
      customer_resource,
      live_chat,
      agency_id,
      status,
      interact_type,
      details_status,
      interact_result,
      ads_id,
      clinic_id,
      category_id,
      fb_client_id,
      fb_page_id,
      note,
    } = req.body;
    let _user = null;

    const { data } = await supabase
    .from("users")
    .select("*")
    .eq("fb_client_id", fb_client_id);

  if (data && data.length) {
    _user = data[0];
  }

    if (!_user && phone != null) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone);

      if (data && data.length) {
        _user = data[0];
      }
    } 

    if (_user) {
      console.log(_user);
      await supabase
        .from("users")
        .update({
          fb_name,
          name,
          phone,
          customer_resource,
          live_chat,
          agency_id,
          status,
          clinic_id,
          interact_type,
          details_status,
          interact_result,
          ads_id,
          category_id,
          fb_client_id,
          note:
            note != null
              ? [...(_user?.note ?? []), note]
              : [...(_user?.note ?? [])],
        })
        .eq("id", _user.id);
    } else {
      await supabase.from("users").insert({
        fb_name,
        name,
        phone,
        customer_resource,
        live_chat,
        agency_id,
        status,
        clinic_id,
        interact_type,
        details_status,
        interact_result,
        ads_id,
        note: note != null ? [note] : null,
        category_id,
        fb_client_id,
        avatar: `https://chatbox-static.botbanhang.vn/v1/app/avatar/${fb_page_id}__${fb_client_id}.jpeg`,
      });
    }

    return res.status(200).json({ status: "OK" });
  });

  login = catchAsync(async (req, res, next) => {
    const defaultUsername = "adminaura@gmail.com";
    const defaultPassword = "adminaura@123";

    const { username, password } = req.body;

    if (username == defaultUsername && password == defaultPassword) {
      return res.status(200).json({
        status: "ok",
        code: 200,
      });
    } else {
      return res.status(200).json({
        status: "not found",
        code: 404,
      });
    }
  });
}

module.exports = new BotbanhangController();
