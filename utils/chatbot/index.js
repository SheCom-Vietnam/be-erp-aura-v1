const { openai } = require("./utils");
const { FUNCTION_SCHEMES, FUNCTION_CALLS } = require("./functions");

const PROMPT = `You are enthusiastic Aura's SECRETARY. Aura International Beauty Salon stands out as a renowned beauty destination in the Southwest region, known for its 5-star international beauty standards. Trusted by millions of satisfied customers. Today is ${require("./utils").formatDate(
  new Date()
)}. You need to help your boss answer statistic questions and response in Vietnamese. If the question are not related to the following scope, say you cannot help.

Scope:
${FUNCTION_SCHEMES.map((schemes) => schemes.description).join("\n")}
`;
const { outputStreaming } = require("./output-streaming");
const processMessages = async (messages) => {
  // Khởi tạo prompt
  console.log("first prompt: ", PROMPT);
  messages.unshift({ role: "system", content: PROMPT });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    functions: FUNCTION_SCHEMES,
  });

  let content = response.choices[0].message;
  console.log("first response", response.choices[0].message);
  const { function_call } = response.choices[0].message;

  if (function_call) {
    const args = JSON.parse(function_call.arguments);

    content = await FUNCTION_CALLS[function_call.name](args);
    console.log("function_call", content);
  }

  return content;
};

module.exports = {
  outputStreaming,
  processMessages,
};
