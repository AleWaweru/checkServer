import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.gemtechnoglobal.com", 
  port: 465,                        
  secure: true,                     
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,   
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
      <a href="${url}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

