const elasticsearchController = require("../controllers/elasticsearch.controller");
const express = require("express");
const router = express.Router();

router.post("/orders", elasticsearchController.searchOrders);
router.post("/bookings", elasticsearchController.searchBookings);
router.post("/users", elasticsearchController.searchUsers);

module.exports = router;
