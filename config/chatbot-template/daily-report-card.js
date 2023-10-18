// interface DailyReportCardInterface {
//   date: string; //dd/mm/yyyy
//   clinic: string;
//   booking: {
//     count_booking: number;
//     count_cancel_booking: number;
//     count_noshow_booking: number;
//     count_checkin_booking: number;
//   };
//   //money
//   checkout: {
//     total_paid: number;
//     total_debit: number;
//     total_price: number;
//   };
// }

const { convertVND } = require("../../utils/helper");
const dailyReportCard = (report) => {
  const { date, clinic, booking, checkout } = report;
  const template = {
    msg_type: "interactive",

    card: {
      elements: [
        {
          tag: "markdown",
          content: "**Báo cáo doanh số**\n",
        },
        {
          tag: "column_set",
          flex_mode: "bisect",
          background_style: "grey",
          horizontal_spacing: "default",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              elements: [
                {
                  tag: "markdown",
                  text_align: "center",
                  content: `Doanh thu\n**<font color='green'>${convertVND(
                    checkout.total_price
                  )}</font>**`,
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              elements: [
                {
                  tag: "markdown",
                  text_align: "center",
                  content: `Thực thu\n**<font color='green'>${convertVND(
                    checkout.total_paid
                  )}</font>**`,
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              elements: [
                {
                  tag: "markdown",
                  text_align: "center",
                  content: `Công nợ\n**<font color='red'>${convertVND(
                    checkout.total_debit
                  )}</font>**`,
                },
              ],
            },
          ],
        },
        {
          tag: "markdown",
          content: "**Báo cáo đặt hẹn**",
        },
        {
          tag: "column_set",
          flex_mode: "none",
          background_style: "grey",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "**Đặt hẹn**",
                  text_align: "left",
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "**Số đặt hẹn**",
                  text_align: "left",
                },
              ],
            },
          ],
        },
        // row data
        {
          tag: "column_set",
          flex_mode: "none",
          background_style: "default",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "Đặt hẹn thành công",
                  text_align: "left",
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: `<font color='green'>↑${booking.count_booking}</font>`,
                  text_align: "left",
                },
              ],
            },
          ],
        },

        {
          tag: "column_set",
          flex_mode: "none",
          background_style: "default",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "Check-in",
                  text_align: "left",
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: `<font color='green'>↑${booking.count_checkin_booking}</font>`,
                  text_align: "left",
                },
              ],
            },
          ],
        },

        {
          tag: "column_set",
          flex_mode: "none",
          background_style: "default",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "Check-in",
                  text_align: "left",
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: `<font color='red'>↓${booking.count_cancel_booking}</font>`,
                  text_align: "left",
                },
              ],
            },
          ],
        },

        {
          tag: "column_set",
          flex_mode: "none",
          background_style: "default",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: "Check-in",
                  text_align: "left",
                },
              ],
            },
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "top",
              elements: [
                {
                  tag: "markdown",
                  content: `<font color='red'>↓${booking.count_noshow_booking}</font>`,
                  text_align: "left",
                },
              ],
            },
          ],
        },
      ],
      header: {
        template: "blue",
        title: {
          content: `Tổng kết ngày ${date} -${clinic}`,
          tag: "plain_text",
        },
      },
    },
  };
  return template;
};

module.exports = dailyReportCard;
