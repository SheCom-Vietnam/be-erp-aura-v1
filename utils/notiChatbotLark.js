function formatBookingNoti(item) {
  const { booking } = item;
  return {
    booking_id: booking.order_id,
    clinic_id: booking.clinic.id,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    customer_name: booking.user.name,
    ads_source: booking.user.ads,
    customer_source: booking.user.customer_resource,
    service: booking.services,
    staff_creator: booking.staff,
  };
}

module.exports = {
  formatBookingNoti,
};
