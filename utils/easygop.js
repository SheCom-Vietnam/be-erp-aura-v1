const token = process.env.EASYGOP_TOKEN;
const host = process.env.EASYGOP_URL;

module.exports = {
    routes: {
        acquireUser: `${host}/request/user`,
        installmentPlan: host + "/request/installment-plan",
        order: host + "/request/order",
        confirm: host + "/order/first-confirm",
        receiveOrderStatus: host + "/order/receive-order-status",
        orderDetail: host + "/order/detail?order_id=",
        orderCancel: host + "/order/cancel",
    },
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
};
