const catchAsync = require('../helpers/catchAsync');
const { processMessages, outputStreaming } = require('../utils/chatbot');
const { replaceUndefinedOrNull } = require('../utils/chatbot/utils');

class ChatbotController {
  chatbotAdmin = catchAsync(async (req, res) => {
    let messages = req.body ?? [];
    messages = messages.slice(-3);
    try {
      const content = await processMessages(messages);
      messages.shift();

      // TODO improve newline character for better prompt
      const response = await outputStreaming(
        JSON.stringify(content, replaceUndefinedOrNull),
        messages
      );

      return res
        .status(200)
        .send({ content: response.choices[0].text, role: 'assistant' });
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }
  });
}

module.exports = new ChatbotController();

/*
  Test case:

  thông tin doanh thu tháng này
  thông tin doanh thu vừa rồi
  Doanh thu hôm qua
 */
