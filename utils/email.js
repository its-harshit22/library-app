const sgMail = require('@sendgrid/mail');

// Render se API Key uthao
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendLoginDetails = async (toEmail, name, memberId, password) => {
    
    const msg = {
        to: toEmail, 
        from: process.env.EMAIL_FROM, // Jo email verify kiya tha (e.g. harshit@gmail.com)
        subject: 'Welcome to the Library! 📚',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #007bff;">Welcome, ${name}!</h2>
                <p>Your library membership has been approved.</p>
                
                <div style="background: #f4f4f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Member ID:</strong> ${memberId}</p>
                    <p><strong>Temporary Password:</strong> ${password}</p>
                </div>

                <p>Please login and change your password immediately.</p>
                <a href="https://library-app-z3lk.onrender.com/user-login.html" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Login Now</a>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email sent to ${toEmail}`);
    } catch (error) {
        console.error('❌ SendGrid Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

module.exports = { sendLoginDetails };