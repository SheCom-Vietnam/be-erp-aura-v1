const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend").MailerSend;
const Sender = require("mailersend").Sender;
const Recipient = require("mailersend").Recipient;

const sendSignUpMail = async (toEmail, toUsername, confirmationToken) => {
  try {
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    const variables = [
      {
        email: toEmail,
        substitutions: [
          {
            var: "account.name",
            value: "Aura Beauty Group",
          },
          {
            var: "support_email",
            value: "https://zalo.me/3003135941649408838",
          },
          {
            var: "confirmation_url",
            value: confirmationToken,
          },
        ],
      },
    ];
    const recipients = [new Recipient(toEmail, toUsername)];
    const sentFrom = new Sender("helper@aura.shecom.asia", "Aura Hepler");
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Xác nhận đăng kí tài khoản")
      .setTemplateId("x2p03479y67gzdrn")
      .setVariables(variables);
    const response = await mailersend.email.send(emailParams);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const sendRecoveryPass = async (toEmail, toUsername, recoveryUrl) => {
  try {
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    const variables = [
      {
        email: toEmail,
        substitutions: [
          {
            var: "username",
            value: toUsername,
          },
          {
            var: "account_name",
            value: "Aura Beauty Group",
          },
          {
            var: "support_email",
            value: "https://zalo.me/3003135941649408838",
          },
          {
            var: "recovery_url",
            value: recoveryUrl,
          },
        ],
      },
    ];
    const recipients = [new Recipient(toEmail, toUsername)];
    const sentFrom = new Sender("helper@aura.shecom.asia", "Aura Hepler");
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Khôi phục mật khẩu")
      .setTemplateId("z3m5jgr9y70gdpyo")
      .setVariables(variables);
    const response = await mailersend.email.send(emailParams);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};
module.exports = { sendSignUpMail, sendRecoveryPass };
