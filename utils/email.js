const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  let hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  let amOrPm = "AM";
  if (hour >= 12) {
    amOrPm = "PM";
    hour -= 12;
  }
  if (hour === 0) {
    hour = 12;
  }

  return `${day} - ${month} - ${year} ${hour}:${minute}:${second} ${amOrPm}`;
}

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Aponiar <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.email = user.email;
    this.password=user.password;
    this.startAt=formatTimestamp(user.startAt);
    this.endAt=formatTimestamp(user.endAt);

  }

  
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.SENDINBLUE_HOST,
      port: process.env.SENDINBLUE_PORT,
      auth: {
        user: process.env.SENDINBLUE_EMAIL_USERNAME,
        pass: process.env.SENDINBLUE_EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    //1) Render html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      email: this.email,
      startAt:this.startAt,
      endAt:this.endAt,
      password:this.password,
      url: this.url,
      subject,
    });
    //2)Define email option
   
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };
    //3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Aponiar Exam Board');
  }

  async sendPassword() {
    await this.send(
      'password',
      'Your Password for Aponiar Exam ',
    );
  }
};
