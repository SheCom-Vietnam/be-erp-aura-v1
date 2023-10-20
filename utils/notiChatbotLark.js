function formatBookingNoti(item) {
  const { booking } = item;
  return {
    booking_id: booking.order_id,
    clinic_id: booking?.clinic.id ?? "",
    date: booking?.date ?? "",
    time: booking?.time ?? "",
    status: booking?.status ?? "",
    customer_name: booking?.user?.name ?? "",
    customer_phone: booking?.user?.phone ?? "",

    ads_source: booking?.user?.ads ?? "",
    customer_source: booking?.user?.customer_resource ?? "",
    service: booking?.services ?? [],
    staff_creator: booking?.staff ?? { name: "", role: "" },
  };
}


function formatDailyReport(item) {
  return {
    date: item.date, //dd/mm/yyyy
    clinic: item.clinic.label,
    booking: {
      count_booking: item.booking.count_booking,
      count_cancel_booking: item.booking.count_cancel_booking,
      count_noshow_booking: item.booking.count_noshow_booking,
      count_checkin_booking: item.booking.count_checkin_booking,
    },
    //money
    checkout: {
      total_paid: item.checkout.total_paid,
      total_debit: item.checkout.total_debit,
      total_price: item.checkout.total_price,
    },
  };
}


module.exports = {
  formatBookingNoti,
  formatDailyReport
};
