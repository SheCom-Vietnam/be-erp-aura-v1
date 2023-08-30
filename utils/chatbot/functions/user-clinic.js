const supabase = require("../../../config/supabase");
const { Parser } = require("@json2csv/plainjs");

const rpcFunctionName = "total_statistic_user_clinic";

const functionScheme = {
  name: rpcFunctionName,
  description:
    "Get Aura's user statistic include number of new user, old user, total by each clinic",
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
  const filteredData = data.map((item) => ({
    "Tên chi nhánh": item.clinic_name,
    "Địa chỉ chi nhánh": item.clinic_address,
    "Khách mới": item.new,
    "Khách cũ": item.total - item.new,
    Tổng: item.total,
  }));
  try {
    const csv = new Parser().parse(filteredData);
    return { ...args, csv };
  } catch (err) {
    console.error(err);
    return { ...args, error: err, message: "Some errors occur" };
  }
};

module.exports = { rpcFunctionName, exec, functionScheme };
