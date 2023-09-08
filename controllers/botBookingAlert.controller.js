const catchAsync = require('../helpers/catchAsync');
const axios = require('axios');

// const DENTAL_WEBHOOK_URL =
//   'https://open.larksuite.com/open-apis/bot/v2/hook/f19e94e2-d2c4-4fef-b12f-ea060e1fd410';

/*Test*/
const DENTAL_WEBHOOK_URL =
  'https://open.larksuite.com/open-apis/bot/v2/hook/07d82e36-6e2d-42d6-b044-154e809a9a1d';

class BotBookingAlertController {
  botAlertDentalBooking = catchAsync(async (req, res) => {
    const {
      booking_id,
      clinic,
      date,
      time,
      customer_name,
      ads_source,
      customer_source,
      service,
      note,
    } = req.body;

    const a = {
      msg_type: 'post',
      content: {
        post: {
          en_us: {
            title: 'Booking Aura Dental',
            content: [
              [
                {
                  tag: 'text',
                  text: `Mã Booking: ${booking_id}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Cơ sở: ${clinic}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Ngày giờ đặt hẹn: ${time}   ${date}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Họ tên KH: ${customer_name}`,
                },
              ],

              [
                {
                  tag: 'text',
                  text: `Nguồn Khách: ${customer_source}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Nguồn ADS: ${ads_source}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Dịch vụ: ${service}`,
                },
              ],
              [
                {
                  tag: 'text',
                  text: `Note: ${note}`,
                },
              ],
            ],
          },
        },
      },
    };

    try {
      const res = await axios.post(DENTAL_WEBHOOK_URL, a, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(JSON.stringify(res.data));
      return res.status(200).send({
        status: 'Success',
      });
    } catch (error) {
      console.log('im here');
      return res.status(500).send('error:', error);
    }
  });
}

module.exports = new BotBookingAlertController();
