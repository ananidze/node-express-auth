const nodemailer = require('nodemailer');


const sendEmail = (to, subject, html) => {
    let transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  
    let mailOptions = {
      from: '"Your Name" <user@example.com>',
      to: to,
      subject: subject,
      html: html
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
  };

module.exports = sendEmail;