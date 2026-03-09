import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,
  },
});

// Welcome Email Function

export const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"Sourodip Auth" <${process.env.EMAIL_USER}>`,

    to: to,

    subject: "🎉 Welcome to Our Platform!",

    html: `

   <div style="font-family: Arial; padding: 20px;">

    <h2>Welcome, ${name}! 🎉</h2>

    <p>You have successfully registered.</p>

    <p>We’re excited to have you onboard.</p>

    <br/>

    <p>Best Regards,</p>

    <p><b>banking-backend Team</b></p>

   </div>

  `,
  });
};

export const sendTransactionSuccessEmail = async (
  fromAccount,
  name,
  amount,
  toAccount
) => {
  await transporter.sendMail({
    from: `"Sourodip Auth" <${process.env.EMAIL_USER}>`,

    to: fromAccount,

    subject: "🎉 Transaction is successful!",

    html: `

   <div style="font-family: Arial; padding: 20px;">

    <h2>Welcome, ${name}! 🎉</h2>

    <p>You have successfully sended ${amount} to this ${toAccount}.</p>

    <br/>

    <p>Best Regards,</p>

    <p><b>banking-backend Team</b></p>

   </div>

  `,
  });
};

export const sendTransactionFailedEmail = async (
  userEmail,
  name,
  amount,
  toAccount
) => {
  await transporter.sendMail({
    from: `"Sourodip Auth" <${process.env.EMAIL_USER}>`,

    to: userEmail,

    subject: "❌ Transaction is NOT successful!",

    html: `

   <div style="font-family: Arial; padding: 20px;">

    <h2>Welcome, ${name}! 🎉</h2>

    <p>Your transaction of ${amount} to this ${toAccount} has failed.If money has deducted from your account then it will be back within 24 hours</p>

    <br/>

    <p>Best Regards,</p>

    <p><b>banking-backend Team</b></p>

   </div>

  `,
  });
};
