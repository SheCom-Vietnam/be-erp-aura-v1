const OpenAI = require("openai");
exports.openai = new OpenAI({
  apiKey: "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",
});

exports.replaceUndefinedOrNull = (_, value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value;
};

exports.formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

exports.formatVND = (price) => price.toLocaleString() + " vnđ";
