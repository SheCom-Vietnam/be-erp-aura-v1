const { routes, headers } = require("../utils/easygop");
const axios = require("axios");
const supabase = require("../config/supabase");
const querystring = require("querystring");

const CircularJSON = require("circular-json");

function convertDateFormat(date) {
    if (date) {
        let datearray = date.split("/");
        return datearray[1] + "/" + datearray[0] + "/" + datearray[2];
    }
    return undefined;
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
        //add to database
        // const { status, statusText } = await supabase
        //     .from("easygop_main")
        //     .update({
        //         user_info: userInfo,
        //         installment_plan: installmentPlan,
        //     })
        //     .match({ user_id: userId, order_id: orderInfo?.id });

        let { error } = await supabase.from("easygop_main").insert({
            user_id: userId,
            order_id: orderInfo?.orderId,
            user_info: userInfo,
            installment_plan: installmentPlan,
        });
        console.log(error);
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
                            label: "WAIT_PREPAY",
                        })
                        .match({
                            user_id: userId,
                            order_id: orderInfo?.orderId,
                        })
                        .select();
                    console.log("Data ", updatedData);
                    res.status(200).json({ easygopInfo: updatedData.data[0] });
                }
            } catch (err) {
                let easygopInfo = await supabase
                    .from("easygop_main")
                    .select()
                    .match({
                        user_id: userId,
                        order_id: orderInfo?.orderId,
                    });
                res.status(200).json({ easygopInfo: easygopInfo.data[0] });
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
            // const { status: statusRes, statusText } = await supabase
            //     .from("easygop_history")
            //     .update({
            //         order_status,
            //         period,
            //         period_status,
            //         period_paid,
            //         date_paid,
            //     })
            //     .eq("order_id", order_id);
            await supabase.from("easygop_history").insert({
                order_id,
                order_status,
                period,
                period_status,
                period_paid,
                date_paid,
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
            res.status(statusRes).json(statusText);
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
            console.log(order_id);
            let resData = await axios.get(routes.orderDetail + order_id, {
                headers: headers,
            });
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
            console.log(order_id);
            let resData = await axios.post(
                routes.orderCancel,
                {
                    order_id,
                    reason,
                },
                {
                    headers: headers,
                }
            );
            console.log(resData.data);
            if (resData.data.success) {
                res.status(200).json(resData.data.data);
            }
        } catch (e) {
            return next(e);
        }
    };
}

module.exports = new EasygopController();
