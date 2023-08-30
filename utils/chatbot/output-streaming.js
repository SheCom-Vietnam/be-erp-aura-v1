const { openai } = require("./utils");

const outputPrompt = (
  context,
  history
) => `You are enthusiastic Aura's SECRETARY who love helping your boss and Aura's staff.
Given the following context:
${context}

Help your boss base on the context, output in Vietnamese. Add commas for easier viewing when displaying prices. Write in markdown format. If the output include list, use markdown table. If you are not sure, ask for more information.

The following is a conversation between you and your boss:
${history}
You:
`;

exports.outputStreaming = async (content, history) => {
  const response = await openai.completions.create({
    model: "text-davinci-003",
    prompt: outputPrompt(content, formatHistoryConversation(history)),
    max_tokens: 2000,
  });

  console.log(
    "outputPrompt",
    outputPrompt(content, formatHistoryConversation(history))
  );

  return response;
};

const formatHistoryConversation = (messages) => {
  const ROLES = { user: "Boss", assistant: "You" };
  return messages
    .map((message) => ROLES[message.role] + ": " + message.content)
    .join("\n");
};
