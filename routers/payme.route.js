const paymeController = require("../controllers/payme.controller");
const express = require("express");
const router = express.Router();

router.post("/createQR", paymeController.createQRPayment);
router.post("/callback", paymeController.paymeCallback);
router.get("/test", (req, res) => {
  return res.status(200).send({
    data: "/api/v1/payme/callback",
  });
});
router.get("/socket", paymeController.socket);
module.exports = router;
