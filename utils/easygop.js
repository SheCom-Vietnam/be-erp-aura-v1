const token = "SE3#aNMrJYjihagzecTK";
const host = "https://api.staging.easygop.com/api/v1/deep-partner";
module.exports = {
    routes: {
        acquireUser: `${host}/request/user`,
        installmentPlan: host + "/request/installment-plan",
        order: host + "/request/order",
        confirm: host + "/order/first-confirm",
        receiveOrderStatus: host + "/order/receive-order-status",
    },
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
};
