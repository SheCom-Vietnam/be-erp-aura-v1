const { routes, headers } = require("../utils/easygop");
const axios = require("axios");
const supabase = require("../config/supabase");
const querystring = require("querystring");

const CircularJSON = require("circular-json");
class EasygopController {
  installmentPlan = async (req, res, next) => {
    try {
      let result = await axios.get(
        routes.installmentPlan + "?" + querystring.stringify(req.query),
        {
          headers: headers,
        }
      );
      res.status(200).json(result.data);
    } catch (e) {
      return next(e);
    }
  };

  confirmation = async (req, res, next) => {
    const { userInfo, installmentPlan, bookingInfo, id } = req.body;
    //add to database
    const { status, statusText } = await supabase
      .from("easygop_main")
      .update({
        order_id: bookingInfo?.booking_id,
        user_info: userInfo,
        installment_plan: installmentPlan,
        combo: bookingInfo?.service_name,
      })
      .eq("id", id);
    console.log(status, statusText);
    //easygop request new user
    console.log("User Info", userInfo);

    try {
      let resUserInfo = await axios.post(
        routes.acquireUser,
        { ...userInfo, income: Number(userInfo?.income) },
        {
          headers: headers,
        }
      );
      //easygop request new order
      console.log("Res Info", resUserInfo.data);

      let result = await axios.post(
        routes.order,
        {
          period: Number(installmentPlan?.period),
          total_order: Number(installmentPlan?.total_order),
          service_fee: Number(installmentPlan?.service_fee),
          prepay: Number(installmentPlan?.prepay),
          paid_instalment_period: Number(
            installmentPlan?.paid_instalment_period
          ),
          service_fee_period: Number(installmentPlan?.service_fee_period),
          discount_period: Number(installmentPlan?.discount_period),
          discount_program_id: Number(installmentPlan?.discount_program_id),
          user_id: resUserInfo?.data?.data.id,
          product_name: bookingInfo?.service_name,
          product_image: bookingInfo?.service_image,
          product_price: Number(bookingInfo?.service_price),
          coordination: "10.8016389,106.7148768",
        },
        {
          headers: headers,
        }
      );
      console.log(result.data);
      const updatedData = await supabase
        .from("easygop_main")
        .update({
          easygop_order_id: result.data.data.order_id,
          status: result.data.data.status,
          payment_info: result.data.data.payment_info,
        })
        .eq("id", id)
        .select();
      res.status(200).json(updatedData);
    } catch (e) {
      console.log(e);
    }
  };

  firstPayment = async (req, res, next) => {
    const { user_id } = req.body;
    const { data, status, statusText } = await supabase
      .from("easygop_main")
      .select("order_id, installment_plan, min(created_at)")
      .eq("user_id", user_id)
      .single();
    if (status != 200) return res.status(status).send(statusText);

    try {
      let result = await axios.post(
        routes.confirm,
        {
          order_id: data.order_id,
          amount: data.prepay,
          transaction_logs: "",
        },
        {
          headers: headers,
        }
      );
      if (result.data.status == "paid_prepay") {
        await supabase.from("easygop_history").insert({
          date_paid: "",
          order_id: data.order_id,
          order_status: "done",
          period: "1",
          period_paid: data.installment_plan.prepay,
          period_status: "paid",
        });
      }
    } catch (e) {
      console.log(e.response);
      return next(e);
    }
  };

  updateOrderHook = async (req, res, next) => {
    try {
      const { order_id, status, payment_info } = req.body;
      const { status: statusRes, statusText } = await supabase
        .from("easygop_history")
        .update({ status, payment_info })
        .match("order_id", order_id);
      res.status(statusRes).json(statusText);
    } catch (e) {
      console.log(e.response);
      return next(e);
    }
  };
  receiveOrderStatus = async (req, res) => {};
  getInstallmentHistory = async (req, res, next) => {
    try {
      const { data, status, statusText } = await supabase.from("easygop_main")
        .select(`
          combo,
          easygop_history (
            order_status,
            period, 
            period_status, 
            period_paid, 
            date_paid
          )
          `);

      if (status != "200") res.status(status).json(statusText);
      else res.status(200).json(data);
    } catch (e) {
      console.log(e.response);
      return next(e);
    }
  };
}

module.exports = new EasygopController();
