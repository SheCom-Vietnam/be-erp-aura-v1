const axios = require("axios");
const moment = require("moment");
const FormData = require("form-data");
const supabase = require("../config/supabase");
const USER_NAME = process.env.VNG_USERNAME;
const PASSWORD = process.env.VNG_PASS;
const BASE_URL = process.env.VNG_URL;
const PROJECT_ID = process.env.VNG_PROJECT_ID;
const checkTimeAccessToken = (time) => {
  const _time = moment(time).add(1, "days");
  const isValid = !moment(Date.now()).isAfter(_time); //if date.now is after _time of token (>24h) is invalid
  return isValid;
};
const newAccessKey = async () => {
  try {
    const response = await axios({
      url: `${BASE_URL}/auth/tokens`,
      method: "POST",
      data: {
        auth: {
          scope: {
            project: {
              id: PROJECT_ID,
              domain: {
                name: "default",
              },
            },
          },
          identity: {
            methods: ["password"],
            password: {
              user: {
                name: USER_NAME,
                password: PASSWORD,
                domain: {
                  name: "default",
                },
              },
            },
          },
        },
      },
    });

    if (response && response.status === 201) {
      return response.headers["x-subject-token"];
    } else {
      console.log("Failed: Get vng accessKey failed");
      return error;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getAccessKey = async () => {
  try {
    let { data: vng_token, error } = await supabase
      .from("vng_token")
      .select("*");
    if (error) {
      throw error;
    } else {
      if (vng_token.length === 0) {
        const accessKey = await newAccessKey();
        if (accessKey) {
          const { data, error } = await supabase
            .from("vng_token")
            .insert({ access_token: accessKey })
            .select("*")
            .single();
          if (error) {
            throw error;
          } else if (data) {
            return data;
          }
        }
      }
      if (!checkTimeAccessToken(vng_token[0].createdated_at)) {
        const accessKey = await newAccessKey();
        if (accessKey) {
          console.log(accessKey);
          const { data, error } = await supabase
            .from("vng_token")
            .update({ access_token: "accessKey" })
            .eq("id", vng_token[0].id)
            .select("*")
            .single();
          if (error) {
            throw error;
          } else if (data) {
            return data;
          }
        }
      }
      return vng_token[0];
    }
  } catch (error) {
    throw error;
  }
};
const upload = async (data, fileName) => {
  try {
    const { access_token } = await getAccessKey();
    const formData = new FormData();
    formData.append("file", data);
    const response = axios({
      method: "POST",
      url: `https://hcm01.vstorage.vngcloud.vn/v1/AUTH_16700a411c8e4e3da18b8b42dbca2890/Aura Group/${fileName}`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Auth-Token": `${access_token}`,
      },
    });
    console.log(response);
  } catch (err) {
    throw err;
  }
};
module.exports = { getAccessKey, upload };
