import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
      tls: { rejectUnauthorized: false },
    });

    let info = await transporter.sendMail({
      from: '"Support" <support@michaelwenlu.com>',
      to,
      subject: 'Password Reset',
      html: html,
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Send email error: ${error}`);
  }
}
