const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            form: '"Real Estate App" <noreply@realestatemarket.com>',
            to: email,
            subject: 'Welcome to our Real Estate Marketplace',
            html: `
                <h2>Welcome aboard, ${name}! 🏠</h2>
                <p>We are thrilled to have you join our Real Estate Marketplace.</p>
                <p>You can now start browsing properties, saving your favorites, and connecting with sellers.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Real Estate Team</strong></p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendLoginAlert = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: '"Real Estate Security" <security@realestatemarket.com>',
            to: email,
            subject: 'Security Alert: New Login to Your Account',
            html: `
                <h2>Hello ${name},</h2>
                <p>We noticed a successful login to your Real Estate Marketplace account just now.</p>
                <p>If this was you, you can safely ignore this email.</p>
                <p style="color: red;"><strong>If you did not log in, please reply to this email or reset your password immediately.</strong></p>
                <br>
                <p>Stay secure,</p>
                <p><strong>The Real Estate Security Team</strong></p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Login alert sent to ${email}`);
    } catch (error) {
        console.error("Error sending login alert:", error.message);
    }
};



module.exports = { sendWelcomeEmail, sendLoginAlert };

