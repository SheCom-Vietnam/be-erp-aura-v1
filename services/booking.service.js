const axios = require("axios");
const supabase = require("../config/supabase");

const getBookingsInNHours = async (startTime, nHours) => {
  try {
    console.log("getBookingsInNHours", startTime);
    const { data, error } = await supabase.rpc("get_bookings_in_n_hours", {
      input_time: startTime,
      nhours: nHours, // Numeric valu
    });

    if (error) console.error(error);

    // console.log("getBookingsInNHours", data);
    if (error) {
      return null;
    } else if (data.length > 0) {
      return data;
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  getBookingsInNHours,
};
