import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, username, otp) => {
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
  await transporter.sendMail({
    from: `"Revly Beauty Community" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Revly email 💗",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: auto;
        padding: 35px 25px;
        background: #fffafa;
        color: #292326;
      ">
        <div style="
          text-align: center;
          padding: 25px;
          background: #fff0f5;
          border-radius: 18px;
        ">
          <div style="
            font-size: 38px;
            color: #ed4f87;
            margin-bottom: 10px;
          ">
            ♡
          </div>

          <h1 style="
            margin: 0;
            color: #d93670;
            font-size: 28px;
          ">
            Welcome to Revly 💗
          </h1>
        </div>

        <div style="padding: 25px 5px;">
          <p style="font-size: 16px;">
            Hi ${username},
          </p>

          <p style="
            color: #665c61;
            line-height: 1.7;
          ">
            Thanks for joining Revly! Use the verification code below
            to verify your email address.
          </p>

          <div style="
            margin: 28px 0;
            padding: 18px;
            text-align: center;
            background: white;
            border: 1px solid #f5c9d9;
            border-radius: 14px;
          ">
            <div style="
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #ed4f87;
            ">
              ${otp}
            </div>
          </div>

          <p style="
            color: #777176;
            font-size: 13px;
          ">
            This code expires in 10 minutes.
          </p>

          <p style="
            color: #777176;
            font-size: 13px;
            line-height: 1.6;
          ">
            If you didn't create a Revly account, you can safely ignore
            this email.
          </p>
        </div>

        <p style="
          text-align: center;
          color: #a3949a;
          font-size: 12px;
          margin-top: 20px;
        ">
          Made with ♡ by Revly
        </p>
      </div>
    `,
  });
};