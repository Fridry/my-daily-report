require("dotenv").config();

const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_USER_RECIPIENT = process.env.EMAIL_USER_RECIPIENT;

(async function run() {
  console.log("Running report...");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: EMAIL_USER,
    to: EMAIL_USER_RECIPIENT,
    subject: "Daily Report",
    text: `
    Daily Report
  `,
    html: `
    <h1>Daily Report</h1>
  `,
  });
})();
