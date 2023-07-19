const { routes, headers } = require("../utils/easygop");
const axios = require("axios");
const supabase = require("../config/supabase");
const querystring = require("querystring");

const CircularJSON = require("circular-json");

function getPeriodsPay(period, prepay, paid_instalment_period, orderId) {
    let periods = [];
    periods.push({
        order_status: "processing",
        period: 1,
        period_status: "unpaid",
        period_paid: prepay,
        order_id: orderId,
    });
    for (let i = 0; i < period - 1; i++) {
        periods.push({
            period: i + 2,
            order_status: "processing",
            period_status: "unpaid",
            period_paid: paid_instalment_period,
            order_id: orderId,
        });
    }
    return periods;
}

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
        const { userInfo, installmentPlan, orderInfo, userId } = req.body;
        const { status, statusText } = await supabase
            .from("easygop_main")
            .update({
                user_info: userInfo,
                installment_plan: installmentPlan,
            })
            .match({ user_id: userId, order_id: orderInfo?.orderId });

        // let { error } = await supabase.from("easygop_main").insert({
        //     user_id: userId,
        //     order_id: orderInfo?.orderId,
        //     user_info: userInfo,
        //     installment_plan: installmentPlan,
        // });
        //easygop request new user
        try {
            //easygop request new order
            let resUserInfo = await axios.post(
                routes.acquireUser,
                { ...userInfo, income: Number(userInfo?.income) },
                {
                    headers: headers,
                }
            );
            console.log("User info", resUserInfo.data);
            console.log("Implement", installmentPlan);
            console.log("Order Info", orderInfo);
            console.log("Body", {
                period: installmentPlan?.period,
                total_order: installmentPlan?.total_order,
                service_fee: installmentPlan?.service_fee,
                prepay: installmentPlan?.prepay,
                paid_instalment_period: installmentPlan?.paid_instalment_period,
                service_fee_period: installmentPlan?.service_fee_period,
                discount_period: installmentPlan?.discount_period,
                discount_program_id:
                    installmentPlan?.discount_program_id || null,
                user_id: resUserInfo?.data?.data.id,
                product_name: orderInfo?.bookings[0].service_id?.name,
                product_image: orderInfo?.bookings[0].service_id?.image,
                product_price: orderInfo?.totalServicePrice,
                coordination: "10.8016389,106.7148768",
            });
            try {
                let result = await axios.post(
                    routes.order,
                    {
                        period: installmentPlan?.period,
                        total_order: installmentPlan?.total_order,
                        service_fee: installmentPlan?.service_fee,
                        prepay: installmentPlan?.prepay,
                        paid_instalment_period:
                            installmentPlan?.paid_instalment_period,
                        service_fee_period: installmentPlan?.service_fee_period,
                        discount_period: installmentPlan?.discount_period,
                        discount_program_id:
                            installmentPlan?.discount_program_id,
                        user_id: resUserInfo?.data?.data.id,
                        product_name: orderInfo?.bookings[0]?.service_id?.name,
                        product_image:
                            orderInfo?.bookings[0]?.service_id?.image,
                        product_price: orderInfo?.totalServicePrice,
                        coordination: "10.8016389,106.7148768",
                    },
                    {
                        headers: headers,
                    }
                );

                if (result.data.success) {
                    const updatedData = await supabase
                        .from("easygop_main")
                        .update({
                            easygop_order_id: result.data.data.order_id,
                            easygop_user_id: resUserInfo?.data?.data.id,
                            status: result.data.data.status,
                            payment_info: result.data.data.payment_info,
                        })
                        .match({
                            user_id: userId,
                            order_id: orderInfo?.orderId,
                        })
                        .select();
                    res.status(200).json({ easygopInfo: updatedData.data[0] });
                    let periodsList = getPeriodsPay(
                        installmentPlan?.period,
                        installmentPlan?.prepay,
                        installmentPlan?.paid_instalment_period,
                        result.data.data.order_id
                    );
                    for (let i = 0; i < periodsList.length; i++) {
                        await supabase
                            .from("easygop_history")
                            .insert(periodsList[i]);
                    }
                    console.log("Data ", updatedData);
                }
            } catch (err) {
                res.status(200).json({
                    error: true,
                    message:
                        "Bạn hiện đang có một đơn trả góp khác trên hệ thống.",
                });
            }
        } catch (e) {
            console.log(e);
            res.status(400).json({
                message: "Something were wrong in server",
            });
        }
    };

    firstPayment = async (req, res, next) => {
        const { order_id } = req.body;
        const { data, status, statusText } = await supabase
            .from("easygop_main")
            .select()
            .eq("order_id", order_id)
            .single();
        if (status != 200) return res.status(status).send(statusText);

        try {
            let result = await axios.post(
                routes.confirm,
                {
                    order_id: data.easygop_order_id,
                    amount: data.installment_plan.prepay,
                    transaction_logs: "",
                },
                {
                    headers: headers,
                }
            );
            console.log(result);
            if (result.data.data.status == "paid_prepay") {
                await supabase
                    .from("easygop_history")
                    .update({
                        date_paid: new Date().toDateString(),
                        order_status: "processing",
                        period_status: "paid",
                    })
                    .match({ order_id: data.easygop_order_id, period: 1 });
                await supabase
                    .from("easygop_main")
                    .update({
                        status: "paid_prepay",
                    })
                    .match({
                        order_id: data.order_id,
                        easygop_order_id: data.easygop_order_id,
                    });
                return res
                    .status(status)
                    .json({ message: "Pay prepay success" });
            }
            return res.status(status).json({ message: "Pay prepay fail" });
        } catch (e) {
            console.log(e.response);
            return next(e);
        }
    };
    receiveIPN = async (req, res, next) => {
        try {
            const {
                order_id,
                order_status,
                period,
                period_status,
                period_paid,
                date_paid,
            } = req.body;
            await supabase
                .from("easygop_history")
                .update({
                    order_status,
                    period_status,
                    period_paid,
                    date_paid,
                })
                .match({ order_id, period });
            await supabase
                .from("easygop_main")
                .update({
                    status: order_status,
                })
                .match({
                    easygop_order_id: order_id,
                });
            res.status(200).json({ message: "Success" });
        } catch (e) {
            console.log(e.response);
            return next(e);
        }
    };
    updateOrderHook = async (req, res, next) => {
        try {
            const { order_id, status, payment_info } = req.body;
            const { status: statusRes, statusText } = await supabase
                .from("easygop_main")
                .update({ status, payment_info })
                .eq("easygop_order_id", order_id);
            res.status(200).json({ message: "success" });
        } catch (e) {
            console.log(e.response);
            return next(e);
        }
    };
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

    getOrderDetail = async (req, res, next) => {
        try {
            let order_id = req.query.orderId;
            const { data, status, statusText } = await supabase
                .from("easygop_main")
                .select()
                .eq("order_id", order_id)
                .single();

            if (status != 200) return res.status(status).send(statusText);
            let resData = await axios.get(
                routes.orderDetail + data.easygop_order_id,
                {
                    headers: headers,
                }
            );
            if (resData.data.success) {
                res.status(200).json(resData.data.data);
            }
        } catch (e) {
            return next(e);
        }
    };
    cancelOrder = async (req, res, next) => {
        try {
            let { order_id, reason } = req.body;
            const { data, status, statusText } = await supabase
                .from("easygop_main")
                .select()
                .eq("order_id", order_id)
                .single();
            if (status != 200) return res.status(status).send(statusText);
            console.log(data);
            let resData = await axios.post(
                routes.orderCancel,
                {
                    order_id: data.easygop_order_id,
                    reason,
                },
                {
                    headers: headers,
                }
            );
            console.log(resData.data);
            if (resData.data.success) {
                await supabase
                    .from("easygop_main")
                    .update({
                        status: resData.data?.data.status,
                    })
                    .match({ order_id: order_id });
                res.status(200).json(resData.data.data);
            }
        } catch (e) {
            return next(e);
        }
    };

    hookReceiveCancelOrder = async (req, res, next) => {
        try {
            let { order_id, status } = req.body;
            console.log(order_id);
            if (order_id) {
                let { data, error } = await supabase
                    .from("easygop_main")
                    .update({ status: status })
                    .match({ easygop_order_id: order_id });
                res.status(200).json({ data, error });
            }
        } catch (e) {
            return next(e);
        }
    };
}

module.exports = new EasygopController();
