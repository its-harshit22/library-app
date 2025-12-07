const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Function to Send Login Details
const sendLoginDetails = async (toEmail, name, memberId, password) => {
    const mailOptions = {
        from: '"Library Admin" <your_email@gmail.com>',
        to: toEmail,
        subject: 'Welcome to Library - Your Login Details',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #007bff;">Welcome to the Library! 📚</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your account has been successfully created. Here are your login credentials:</p>
                
                <div style="background: #f4f4f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Member ID:</strong> ${memberId}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>

                <p>Please login and change your password immediately.</p>
                <p>Regards,<br>Library Management Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${toEmail}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = { sendLoginDetails };