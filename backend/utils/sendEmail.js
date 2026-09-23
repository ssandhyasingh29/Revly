export async function sendVerificationEmail(email, verificationUrl) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                name: "Revly",
                email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [{ email }],
            subject: "Verify your Revly account 💗",
            htmlContent: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 30px auto;
                    padding: 35px;
                    background: #fff5f8;
                    border-radius: 16px;
                    text-align: center;
                    color: #333;
                ">

                    <h1 style="
                        color: #e75480;
                        margin-bottom: 10px;
                    ">
                        Welcome to Revly! 💗
                    </h1>

                    <p style="
                        font-size: 16px;
                        line-height: 1.6;
                    ">
                        Thank you for joining the Revly beauty community.
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.6;
                    ">
                        Please verify your email address to activate
                        your Revly account.
                    </p>

                    <div style="margin: 30px 0;">
                        <a
                            href="${verificationUrl}"
                            style="
                                display: inline-block;
                                padding: 14px 28px;
                                background: #e75480;
                                color: white;
                                text-decoration: none;
                                font-weight: bold;
                                font-size: 16px;
                                border-radius: 10px;
                            "
                        >
                            Verify My Email 💗
                        </a>
                    </div>

                    <p style="
                        font-size: 14px;
                        color: #777;
                        line-height: 1.5;
                    ">
                        This verification link will expire in 1 hour.
                    </p>

                    <p style="
                        font-size: 13px;
                        color: #999;
                        margin-top: 30px;
                    ">
                        If you didn't create a Revly account,
                        you can safely ignore this email.
                    </p>

                    <p style="
                        color: #e75480;
                        font-weight: bold;
                        margin-top: 25px;
                    ">
                        — Team Revly 💗
                    </p>

                </div>
            `,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();

        console.error("Brevo email failed:", errorData);

        throw new Error(
            `Brevo email failed: ${JSON.stringify(errorData)}`
        );
    }

    const data = await response.json();

    console.log("Verification email sent:", data);

    return data;
}