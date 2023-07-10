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
        const { userInfo, installmentPlan, combo, id } = req.body;
        //add to database
        const { status, statusText } = await supabase
            .from("easygop_main")
            .update({
                easygop_order_id: order.order_id,
                user_info: userInfo,
                installment_plan: {
                    ...installmentPlan,
                    masked_label: undefined,
                },
                combo,
            })
            .eq("id", id);
        if (status != 201) return res.status(status).send(statusText);

        //easygop request new user
        try {
            let resUserInfo = await axios.post(routes.acquireUser, userInfo, {
                headers: headers,
            });
            //easygop request new order

            let result = await axios.post(
                routes.order,
                {
                    ...installmentPlan,
                    user_id: resUserInfo?.user_id,
                    product_name: combo,
                },
                {
                    headers: headers,
                }
            );
            res.status(200).json(result.data);
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
            const { data, status, statusText } = await supabase.from(
                "easygop_main"
            ).select(`
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
