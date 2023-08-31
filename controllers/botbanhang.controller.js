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
      category_id,
      fb_client_id,
    } = req.body;

    const { data: _user } = await supabase
      .from("users")
      .select("*")
      .or(`phone.eq.${phone},fb_client_id.eq.${fb_client_id}`)
      .single();
    if (_user) {
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
          interact_type,
          details_status,
          interact_result,
          ads_id,
          category_id,
          fb_client_id,
        })
        .or(`phone.eq.${phone},fb_client_id.eq.${fb_client_id}`);
    } else {
      await supabase.from("users").insert({
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
        category_id,
        fb_client_id,
      });
    }
  });
}

module.exports = new BotbanhangController();
