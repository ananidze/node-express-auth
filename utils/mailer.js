const nodemailer = require("nodemailer");

const sendEmail = (to, subject, html, result, description) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: '"Your Name" <user@example.com>',
    to: to,
    subject: subject,
    html: html,
    attachments: [
      {
        filename: "result.png",
        content: result.split("base64,")[1],
        encoding: "base64",
        cid: "result",
      },
      {
        filename: "result.pdf",
        content: description,
      }
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

module.exports = sendEmail;
