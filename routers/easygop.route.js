const EasygopController = require("../controllers/easygop.controller");
const express = require("express");
const router = express.Router();

router.get("/request/installment-plan", EasygopController.installmentPlan);
router.post("/confirmation", EasygopController.confirmation);
router.post("/firstPay", EasygopController.firstPayment);

router.get("/installment-history", EasygopController.getInstallmentHistory);

//hook for easygop
router.post("/update-order-hook", EasygopController.updateOrderHook);
module.exports = router;
