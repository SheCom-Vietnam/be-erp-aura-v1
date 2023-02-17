const axios = require("axios");

const tenantToken = async () => {
  try {
     var data = JSON.stringify({
        "app_id": "cli_a361a3bc4939d00a",
        "app_secret": "u2Q2FTc0Ma7yrS1OvBUBPctL5VMyhqem"
    });
    var config = {
        method: 'POST',
        url: 'https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };
      const token = await axios(config);
      console.log("================================================")
      console.log(token.data.tenant_access_token)
      console.log("================================================")
      return token.data.tenant_access_token
  } catch (e) {
    throw new Error(message);
  }
};

module.exports = {
 tenantToken
};