import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testGmail = async () => {
  console.log('Testing Gmail configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Test the connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email from Admin Dashboard',
      text: 'This is a test email to verify Gmail configuration.',
      html: '<p>This is a test email to verify Gmail configuration.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Solution suggestions:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
      console.log('2. Generate an App Password from Google Account settings');
      console.log('3. Use the 16-character App Password (not your regular Gmail password)');
      console.log('4. Check if "Less secure app access" is enabled (if not using App Password)');
    }
  }
};

testGmail();