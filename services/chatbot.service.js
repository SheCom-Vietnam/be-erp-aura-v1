const axios = require("axios");
const dailyReportCard = require("../templates/chatbot/daily-report-card");
const formatHelper = require("../utils/helper");
const chatbotHelpers = require("../utils/notiChatbotLark");
const botLarkService = require("./botBooking.service");

const sendRemindBookingToLark = async (booking) => {
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

  try {
    await axios.post(webhook_group, a, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("sendRemindBookingToLark Error", error);
  }
  return;
};

const sendAllRemindBookingToLark = async (bookings) => {
  let interval = 0;
  console.log("sendAllRemindBookingToLark", bookings);
  bookings.forEach((booking) => {
    interval += 1000;
    console.log("foreach", interval);

    const cb = async () => {
      await sendRemindBookingToLark(booking);
    };
    setTimeout(cb, interval);
  });
};

// input:
const sendDailyReportToLark = async (report) => {
  const { clinic } = report;
  console.log("sendDailyReportToLark", report);
  const webhook_group = await botLarkService.getWebhookBotLark(clinic.id);
  if (!webhook_group) {
    console.log(
      `No webhook URL found for clinic_id: ${clinic.id}. Skipping notification.`
    );
    return; // Skip notification sending
  }
  const today = new Date();
  const formatedDate = formatHelper.formatDDMMYYYY(today);

  const formatReport = chatbotHelpers.formatDailyReport(report);
  console.log("sendDailyReportToLark", formatReport);

  const content = dailyReportCard({ ...formatReport, date: formatedDate });
  try {
    await axios.post(
      "https://open.larksuite.com/open-apis/bot/v2/hook/4cf12f4a-79e7-4bb8-a7aa-be2ed3deeb46",
      content,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log("sendRemindBookingToLark Error", error);
  }
  return;
};

const sendAllDailyReportToLark = async (reports) => {
  let interval = 0;
  console.log("sendAllDailyReportToLard", reports);
  reports.forEach((report) => {
    interval += 2000;
    console.log("foreach", interval);

    const cb = async () => {
      await sendDailyReportToLark(report);
    };
    setTimeout(cb, interval);
  });
};

module.exports = {
  sendRemindBookingToLark,
  sendAllRemindBookingToLark,
  sendDailyReportToLark,
  sendAllDailyReportToLark,
};
