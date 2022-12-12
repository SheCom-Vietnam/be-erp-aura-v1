const {supabase} = require("./supabase")
var fcm = require('fcm-notification');
var FCM = new fcm('./auralt-firebase-adminsdk-j7xv1-bb162b29c1.json');

async function getAllTokenStaffOfClinic(id) {
  try {
  const { data, error } = await supabase
  .from('staffs')
      .select('token_device')
      .eq('clinic_id', id)
      
      const tokens = []
      if (error == null) {
          data.map((item) => {
          tokens.push(...item.token_device)
           })
          return tokens;
      } else (console.log(error))
  } catch (error) {
    throw error;
  }
}

async function sendNotifyNewBookingForStaff(tokens, userId, bookingId) {
  // Get the boooking
      const { data:booking, error:bookingErr } = await supabase
  .from('bookings')
      .select('*')
          .eq('id', bookingId)
    .single()
    console.log('sendNotifyNewBookingForStaff',booking, bookingErr)
    
  // Get the users 
    const { data:user, error:userErr } = await supabase
  .from('users')
      .select('*')
        .eq('id', userId)
    .single()
    
  const bodyNoti = `${user.name} đã đặt dịch vụ ${booking.service_id[0].name} có mã ${booking.id}`

const message = {
  data: { score: '850', time: '2:45' },
    notification:{
            title : 'Có Đặt Hẹn Mới',
            body : bodyNoti
        },
};
  FCM.sendToMultipleToken(message, tokens, function(err, response) {
    if(err){
        console.log('err--', err);
    }else {
        console.log('response-----', response);
    }
 
})
}
module.exports = {
    getAllTokenStaffOfClinic,
    sendNotifyNewBookingForStaff
};
