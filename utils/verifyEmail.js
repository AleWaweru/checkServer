import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Darubini" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your email address",
    html: `
      <h2>Hello ${user.firstName},</h2>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${url}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
