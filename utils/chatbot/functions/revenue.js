const supabase = require("../../../config/supabase");
const { formatVND } = require("../utils");

const rpcFunctionName = "total_statistic_checkout";

const functionScheme = {
  name: rpcFunctionName,
  description: "Get Aura's revenue by time",
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
  const { data, error } = await supabase
    .rpc(rpcFunctionName, {
      start_date: args.start_date,
      end_date: args.end_date,
    })
    .select()
    .single();
  if (error) throw Error(error?.message);
  return {
    ...args,
    revenue: formatVND(data.revenue),
    customer_paid: formatVND(data.customer_paid),
    debit: formatVND(data.debit),
  };
};

module.exports = { rpcFunctionName, exec, functionScheme };
