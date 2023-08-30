const supabase = require("../../../config/supabase");

const rpcFunctionName = "chatbot_get_user_info";

const functionScheme = {
  name: rpcFunctionName,
  description: "Get customer's information Nguyễn Văn Khải",
  parameters: {
    type: "object",
    properties: {},
  },
};

const exec = async (_) => {
  const { data, error } = await supabase
    .rpc(rpcFunctionName, {
      p_user_id: "9984e9a9-f093-4e7c-8b04-0eca913113a1",
    })
    .select()
    .single();
  if (error) throw Error(error?.message);
  return { ...data };
};

module.exports = { rpcFunctionName, exec, functionScheme };
