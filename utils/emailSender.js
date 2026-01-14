const nodemailer = require("nodemailer");

async function sendCertificate(email, name, event, attachmentPath) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "doremonrob3@gmail.com",   // Your Gmail
      pass: "tmta pldb sqjv avui"       // App password (not gmail password)
    }
  });

  let mailOptions = {
    from: "yourgmail@gmail.com",
    to: email,
    subject: `Your Participation Certificate - ${event}`,
    text: `Hello ${name},\n\nHere is your certificate for participating in ${event}.`,
    attachments: [
      {
        filename: `${name}_${event}.pdf`,
        path: attachmentPath
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendCertificate;