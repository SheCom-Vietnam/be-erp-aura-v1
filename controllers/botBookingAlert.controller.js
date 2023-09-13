const supabase = require("../config/supabase");
const catchAsync = require("../helpers/catchAsync");
const botLarkService = require("../services/botBooking.service");
const axios = require("axios");

class BotBookingAlertController {
  botAlertBooking = catchAsync(async (req, res) => {
    const {
      booking_id,
      clinic_id,
      date,
      time,
      customer_name,
      customer_phone,
      ads_source,
      customer_source,
      service,
      staff_creator,
    } = req.body;
    const webhook_group = await botLarkService.getWebhookBotLark(clinic_id);
    console.log("webhook_group", webhook_group);

    const group = await botLarkService.getGroupByWebhook(webhook_group);
    console.log("group chat", group);
    const order_id = await botLarkService.getOrderId(booking_id);
    console.log("group order_id", order_id);
    console.log("service", typeof service);

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
            title: `Booking mới - [${group}]`,
            content: [
              [
                {
                  tag: "a",
                  text: `Mã Booking: ${booking_id}`,
                  href: `https://aura.shecom.asia/dashboard/vs2/orders?order_id=${booking_id}&detail=true`,
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
    console.log("service_basic_info aaaaaa", service_basic_info);

    try {
      await axios.post(webhook_group, a, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log(123, JSON.stringify(res.data));
      return res.status(200).send({
        status: "Success",
      });
    } catch (error) {
      return res.status(500).send("error", error);
    }
  });

  addBotLark = catchAsync(async (req, res) => {
    const { webhookUrl, group, tag } = req.body;
    try {
      const check = await botLarkService.isExistWebhookUrl(webhookUrl);

      if (check == true) {
        const { error } = await supabase
          .from("bot_lark")
          .insert({ webhook_url: webhookUrl, group: group })
          .single();
        if (error) {
          console.log("error add bot", error);
          return;
        } else {
          console.log("success add bot");
          return res.status(200).send({
            status: "Success",
          });
        }
      } else {
        console.log("This bot is Exist");
        return;
      }
    } catch (err) {
      return res.status(500).send("error add bot:", error);
    }
  });
}

module.exports = new BotBookingAlertController();
