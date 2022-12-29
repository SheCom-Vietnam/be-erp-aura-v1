const axios = require("axios");
const moment = require("moment");
const FormData = require("form-data");
const supabase = require("../config/supabase");
const USER_NAME = process.env.VNG_USERNAME;
const PASSWORD = process.env.VNG_PASS;
const BASE_URL = process.env.VNG_URL;
const PROJECT_ID = process.env.VNG_PROJECT_ID;
const checkTimeAccessToken = (time) => {
  const _time = moment(time).add(1, "hours");
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
      return null;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getAccessKey = async () => {
  try {
    let { data: vng_token, error } = await supabase
      .from("vng_token")
      .select("*")
      .single();
    if (!vng_token) {
      const accessKey = await newAccessKey();
      if (accessKey) {
        const { data, error } = await supabase
          .from("vng_token")
          .insert({ access_token: accessKey, time: Date.now() })
          .select("*")
          .single();
        if (error) {
          console.log(error);
          return null;
        } else if (data) {
          console.log("Insert new storage token");
          return data;
        }
      }
    }
    if (!checkTimeAccessToken(vng_token.time)) {
      const accessKey = await newAccessKey();
      if (accessKey) {
        const { data, error } = await supabase
          .from("vng_token")
          .update({ access_token: accessKey, time: Date.now() })
          .eq("id", vng_token.id)
          .select("*")
          .single();
        if (error) {
          return null;
        } else if (data) {
          console.log("Update vng access key ");
          return data;
        }
      }
      return vng_token;
    }
    return vng_token;
  } catch (error) {
    throw error;
  }
};
const upload = async (data, fileName) => {
  try {
    const { access_token } = await getAccessKey();
    const formData = new FormData();
    formData.append("file", data);
    console.log(formData);
    const response = axios({
      method: "POST",
      url: `https://hcm01.vstorage.vngcloud.vn/v1/AUTH_16700a411c8e4e3da18b8b42dbca2890/Aura Group/${fileName}`,
      data: formData,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Auth-Token": `gAAAAABjrVIRx6y-40-Z8UWxN1zwePQ5tLiNZfLoLh7JmpPpPAegP_HdMbfPvpSoJEQGZtqyk_1H6LPqJDe8x3iEw_bkoHz2YY9piFk0Z_u3BWnNOffUkNE67rLErLI0BatWtq2R2r8HthVF1ud3bIdKeWEYANb4PepF9Kxd__3FTQ_1cU608E4`,
      },
    });
    console.log(response);
  } catch (err) {
    throw err;
  }
};
module.exports = { getAccessKey, upload };
