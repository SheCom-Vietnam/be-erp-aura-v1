const EasygopController = require("../controllers/easygop.controller");
const express = require("express");
const router = express.Router();

router.get("/request/installment-plan", EasygopController.installmentPlan);
router.post("/confirmation", EasygopController.confirmation);
router.post("/firstPay", EasygopController.firstPayment);

router.get("/installment-history", EasygopController.getInstallmentHistory);
router.get("/order-detail", EasygopController.getOrderDetail);

//hook for easygop
router.post("/update-order-hook", EasygopController.updateOrderHook);
router.post("/cancel-order", EasygopController.cancelOrder);
router.post("/receive-ipn", EasygopController.receiveIPN);

module.exports = router;
