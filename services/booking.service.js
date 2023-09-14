const axios = require("axios");
const supabase = require("../config/supabase");

const getBookingToday = async (time) => {
  try {
    console.log("getBookingTody", time);
    const { data, error } = await supabase.rpc("get_bookings_in_3_hours", {
      input_time: "2023-01-08 09:00:00+07",
    });
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
  getBookingToday,
};
