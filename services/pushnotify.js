const supabase = require("../config/supabase");
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

async function getTokenDoctorById(id) {
  try {
  const { data, error } = await supabase
  .from('doctors')
      .select('token_device')
    .eq('id', id)
    .single()
      if (error == null) {
          return data.token_device;
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
      body: bodyNoti
  },
    apns: { payload: { aps: { sound: 'default', badge: 1} } },
    
};
  FCM.sendToMultipleToken(message, tokens, function(err, response) {
    if(err){
        console.log('err--', err);
    }else {
        console.log('response-----', response);
    }
 
})
}

async function staffSendNotifyNewBookingForDoctor(tokens, userId, bookingId) {
  // Get the boooking
      const { data:booking, error:bookingErr } = await supabase
  .from('bookings')
      .select('*')
          .eq('id', bookingId)
        .single()
  
  // Get the users 
    const { data:user, error:userErr } = await supabase
  .from('users')
      .select('*')
        .eq('id', userId)
    .single()
    
  const bodyNoti = `Bạn có lịch hẹn mới từ khách hàng ${user.name} với dịch vụ ${booking.service_id[0].name} có mã ${booking.id}`

const message = {
  data: { score: '850', time: '2:45' },
    notification:{
            title : 'Bác Sĩ Có Đặt Hẹn Mới',
            body : bodyNoti
  },
    apns: { payload: { aps: { sound: 'default', badge: 1} } },
};
  FCM.sendToMultipleToken(message, tokens, function(err, response) {
    if(err){
        console.log('err--', err);
    }else {
        console.log('response-----', response);
    }
 
})
}


async function doctorSendNotifyDoneBookingForStaff(tokens, userId, bookingId) {
  // Get the boooking
      const { data:booking, error:bookingErr } = await supabase
  .from('bookings')
      .select('*')
          .eq('id', bookingId)
        .single()
  
  // Get the users 
    const { data:user, error:userErr } = await supabase
  .from('users')
      .select('*')
        .eq('id', userId)
    .single()
    
  const bodyNoti = `Đặt hẹn có mã ${booking.id} của khách hàng ${user.name} đã hoàn thành. Lễ tân tiến hành thanh toán.`
const message = {
  data: { score: '850', time: '2:45' },
    notification:{
            title : 'Bác Sĩ Hoàn Thành Dịch Vụ',
            body : bodyNoti
  },
    apns: { payload: { aps: { sound: 'default', badge: 1} } },
};
  FCM.sendToMultipleToken(message, tokens, function(err, response) {
    if(err){
        console.log('err--', err);
    }else {
        console.log('response-----', response);
    }
 
})
}


async function doctorSendNotifyForDoctor(tokens,doctorId, bookingId,status) {
  // Get the boooking
      const { data:booking, error:bookingErr } = await supabase
  .from('bookings')
      .select('*')
          .eq('id', bookingId)
        .single()
  
 // Get the users 
    const { data:doctor, error:userErr } = await supabase
  .from('doctors')
      .select('*')
        .eq('id', doctorId)
      .single()
  
  let bodyNoti = ''
  if (status == 'them') {
  bodyNoti = `Bác sĩ ${doctor.name} đã thêm bạn vào đặt hẹn có mã ${booking.id}`
  }
   if (status == 'xacnhan') {
     bodyNoti = `Bác sĩ ${doctor.name} đã ĐỒNG Ý yêu cầu của bạn tham gia thực hiện dịch vụ ${booking.service_id[0].name} có mã đặt hẹn ${booking.id}`
      if (status == 'tuchoi') {
  bodyNoti = `Bác sĩ ${doctor.name} đã TỪ CHỐI yêu cầu của bạn tham gia thực hiện dịch vụ ${booking.service_id[0].name} có mã đặt hẹn ${booking.id}`
  }
}

const message = {
  data: { score: '850', time: '2:45' },
    notification:{
            title : 'Bác Sĩ Có Thông Báo Mới',
            body : bodyNoti
  },
    apns: { payload: { aps: { sound: 'default', badge: 1} } },
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
  sendNotifyNewBookingForStaff,
  getTokenDoctorById,
  staffSendNotifyNewBookingForDoctor,
  doctorSendNotifyDoneBookingForStaff,
    doctorSendNotifyForDoctor
};
