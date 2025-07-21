import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 
export const sendResetPasswordEmail = async (user, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}/${user._id}`;

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

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <p>Hi ${user.firstName || user.name},</p>
      <p>You requested a password reset. Click below to proceed:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
};
