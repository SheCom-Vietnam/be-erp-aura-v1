const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const PaymeService = require("../services/payment");
class PaymeController {
  createQRPayment = catchAsync(async (req, res, next) => {
    const { bookingID, amount, customerName } = req.body;
    if (!bookingID || bookingID === "")
      return next(new AppError("Mã booking không hợp lệ", 400));
    if (!amount || isNaN(amount))
      return next(new AppError("Tiền thanh toán không hợp lệ", 400));
    if (!customerName || customerName === "")
      return next(new AppError("Tên khách hàng không hợp lệ", 400));
    const response = await PaymeService.createPaymentQR({
      partnerTransaction: bookingID,
      amount: amount,
      desc: `Thanh toán đơn hàng ${bookingID} của khách hàng ${customerName}`,
      ipnUrl: "https://api-staging.auradental.vn/api/v1/payme/callback",
      payMethod: "VIETQR",
      payData: {
        qrPay: { platform: "mobile" },
      },
    });

    if (!response || response.message) {
      return next(new AppError("Có lỗi xảy ra" + response.message));
    }

    return res.status(200).send({
      status: "Success",
      data: response,
    });
  });
  paymeCallback = catchAsync(async (req, res, next) => {
    const io = res.io;
    const paymeResponse = req.body;
    console.log(paymeResponse);
    io.emit("checkout_status", paymeResponse);
    return res.status(200).send({
      status: "Success",
    });
  });
  socket = catchAsync(async (req, res, next) => {
    const io = res.io;
    console.log("socket");
    const dump = {
      transaction: "6ZRVUIWGKAHL",
      partnerTransaction: "042-196-692",
      paymentId: "EDDJQM3GSF2Z",
      accountId: 4440662620,
      merchantId: 690400,
      storeId: 0,
      payMethod: "VIETQR",
      payCode: "VIETQR",
      amount: 5000,
      fee: 0,
      total: 5000,
      state: "SUCCEEDED",
      desc: "Thanh toán đơn hàng 600-927-501 của khách hàng Nghiêm Trần",
      reason: "",
      extraData: "",
      createdAt: "2022-12-05T02:55:16.105Z",
      updatedAt: "2022-12-05T03:56:12.404Z",
    };
    io.emit("checkout_status", dump);
    return res.status(200).send({
      status: "Success",
      data: dump,
    });
  });
}

module.exports = new PaymeController();
