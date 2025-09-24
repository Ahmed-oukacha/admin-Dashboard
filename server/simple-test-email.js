import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const sendSimpleTestEmail = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const testEmail = 'admin00@gmail.com'; // Change this to your actual email

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: '🔥 Test Email - Admin Dashboard Activation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #4CAF50; text-align: center;">🚀 Account Activation Required</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hello there!</p>
            <p style="font-size: 16px; line-height: 1.6;">This is a test email from your Admin Dashboard system.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/activate/test-token" style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                ✅ Activate Account
              </a>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">
              If you received this email, your email system is working correctly!
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              Admin Dashboard System • Test Email
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Simple test email sent successfully!');
    console.log('📧 Sent to:', testEmail);
    console.log('🆔 Message ID:', result.messageId);
    console.log('📨 Check your email (including spam folder)');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
};

console.log('🧪 Sending simple test email...');
sendSimpleTestEmail();