const supabase = require("../../../config/supabase");
const { Parser } = require("@json2csv/plainjs");

const rpcFunctionName = "total_statistic_staff_attendance";

const functionScheme = {
  name: rpcFunctionName,
  description: "Get Aura's attendance rate",
  parameters: {
    type: "object",
    properties: {
      start_date: {
        type: "string",
        pattern: "^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$",
        description: "The start date",
      },
      end_date: {
        type: "string",
        pattern: "^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$",
        description: "The end date",
      },
    },
    required: ["end_date", "start_date"],
  },
};

const exec = async (args) => {
  const { data, error } = await supabase.rpc(rpcFunctionName, args).select();

  if (error) throw Error(error?.message);
  const filteredData = data.map((item) => {
    const total = item.not_do_count + item.right_count + item.wrong_count;

    const displayPercent = (percent) => `${(percent * 100).toFixed(2)}%`;
    return {
      "Tên chi nhánh": item.clinic_name,
      "Chưa chấm": displayPercent(item.not_do_count / total),
      "Chấm đúng": displayPercent(item.wrong_count / total),
      "Chấm sai": displayPercent(item.right_count / total),
    };
  });
  try {
    const csv = new Parser().parse(filteredData);
    return { ...args, csv };
  } catch (err) {
    console.error(err);
    return { ...args, error: err, message: "Some errors occur" };
  }
};

module.exports = { rpcFunctionName, exec, functionScheme };
