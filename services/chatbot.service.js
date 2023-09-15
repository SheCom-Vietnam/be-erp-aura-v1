const axios = require("axios");

const botLarkService = require("./botBooking.service");

const sendNotificationToLark = async (booking) => {
  const {
    booking_id,
    clinic_id,
    date,
    time,
    status,
    customer_name,
    customer_phone,
    ads_source,
    customer_source,
    service,
    staff_creator,
  } = booking;
  if (!clinic_id) {
    console.log(`No clinic found. Skipping notification.`);
    return; // Skip notification sending
  }
  const webhook_group = await botLarkService.getWebhookBotLark(clinic_id);

  const group = await botLarkService.getGroupByWebhook(webhook_group);
  console.log(
    `No webhook URL found for clinic_id: ${clinic_id}. Skipping notification.`
  );
  if (!webhook_group) {
    console.log(
      `No webhook URL found for clinic_id: ${clinic_id}. Skipping notification.`
    );
    return; // Skip notification sending
  }
  const defaultValues = [
    [
      {
        tag: "text",
        text: `Dịch vụ: ${service[0].name}`,
      },
    ],
    [
      {
        tag: "text",
        text: `Note: ${
          service[0].description ? service[0].description : "Không có note"
        }`,
      },
    ],
  ];

  let service_basic_info =
    service.length > 1
      ? service.flatMap((item, index) => {
          const keyService = "Dịch vụ " + (index + 1);
          const keyDescription = "Note " + (index + 1);

          return [
            [
              {
                tag: "text",
                text: `${keyService}: ${item.name}`,
              },
            ],
            [
              {
                tag: "text",
                text: `${keyDescription}: ${item.description ?? "Chưa có"}`,
              },
            ],
          ];
        })
      : defaultValues;

  const a = {
    msg_type: "post",
    content: {
      post: {
        en_us: {
          title: `Nhắc đặt hẹn - [${group}]`,
          content: [
            [
              {
                tag: "a",
                text: `Mã Booking: ${booking_id}`,
                href: `https://aura-dev.shecom.asia/dashboard/vs2/bookings?row=0&id=${booking_id}&date=${date}&time=${time}&clinic=${clinic_id}&status=${status}&page=1`,
              },
            ],
            [
              {
                tag: "text",
                text: `Cơ sở: ${group}`,
              },
            ],
            [
              {
                tag: "text",
                text: `Ngày giờ đặt hẹn: ${time}   ${date}`,
              },
            ],
            [
              {
                tag: "text",
                text: `Họ tên KH: ${customer_name}`,
              },
            ],
            [
              {
                tag: "text",
                text: `SĐT khách: ${customer_phone}`,
              },
            ],

            [
              {
                tag: "text",
                text: `Nguồn Khách: ${customer_source}`,
              },
            ],
            [
              {
                tag: "text",
                text: `Nguồn ADS: ${ads_source}`,
              },
            ],
            ...service_basic_info,
            [
              {
                tag: "text",
                text: `Nhân viên tạo: ${staff_creator.name}`,
              },
            ],
            [
              {
                tag: "text",
                text: `Chức vụ: ${staff_creator.role}`,
              },
            ],
          ],
        },
      },
    },
  };

  console.log("s*******************************webhook_group", webhook_group);

  try {
    await axios.post(webhook_group, a, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("sendNotificationToLark Error", error);
  }
  return;
};

const sendAllNotificationToLark = async (bookings) => {
  let interval = 0;
  console.log("sendAllNotificationToLark", bookings);
  bookings.forEach((booking) => {
    interval += 1000;
    console.log("foreach", interval);

    const cb = async () => {
      await sendNotificationToLark(booking);
    };
    setTimeout(cb, interval);
  });
};

module.exports = {
  sendNotificationToLark,
  sendAllNotificationToLark,
};
