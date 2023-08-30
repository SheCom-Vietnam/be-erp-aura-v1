const ChatbotController = require("../controllers/chatbot.controller");
router = require("express").Router();

router.post("/admin", ChatbotController.chatbotAdmin);
router.post("/", ChatbotController.chatbotAdmin);

module.exports = router;
