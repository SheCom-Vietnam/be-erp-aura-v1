const { openai } = require("./utils");

const outputPrompt = (
  context,
  history
) => `Imagine you are Aura's dedicated secretary, always eager to assist your boss and the staff at Aura. 

Here's the context you have:
${context}

Your task is to provide assistance to your boss based solely on the given context. Your responses should be in markdown format. If your response includes a table, format it using a markdown table. If the answer is not provided above or the provided context have message 'Some errors occur' or you are unsure, reply that you cannot help. Reply in Vietnamese language.

The following is a conversation between you and your boss (boss is Sếp):
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
