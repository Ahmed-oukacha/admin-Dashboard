import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// اختبار إعدادات الإيميل
async function testEmailSettings() {
  console.log("🔧 اختبار إعدادات Gmail...");
  
  // التحقق من المتغيرات البيئية
  console.log("📧 Gmail User:", process.env.GMAIL_USER);
  console.log("🔑 Gmail Password Length:", process.env.GMAIL_APP_PASSWORD?.length || 0);
  console.log("📬 Admin Email:", process.env.ADMIN_EMAIL);
  
  // إنشاء النقل
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // اختبار الاتصال
    console.log("\n🔄 اختبار الاتصال بـ Gmail...");
    await transporter.verify();
    console.log("✅ الاتصال بـ Gmail نجح!");
    
    // إرسال إيميل اختبار
    console.log("\n📤 إرسال إيميل اختبار...");
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: '🧪 اختبار نظام الإيميل - Asksource Admin',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 نظام الإيميل يعمل بشكل صحيح!</h2>
          <p>هذا إيميل اختبار للتأكد من أن النظام يرسل الإيميلات بنجاح.</p>
          <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      `
    });
    
    console.log("✅ تم إرسال الإيميل بنجاح!");
    console.log("📧 Message ID:", result.messageId);
    
  } catch (error) {
    console.error("❌ خطأ في إعدادات الإيميل:");
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log("\n🔧 حلول مقترحة:");
      console.log("1. تأكد من صحة Gmail App Password");
      console.log("2. تأكد من تفعيل 2-Step Verification");
      console.log("3. جرب إنشاء App Password جديد");
    }
  }
  
  process.exit(0);
}

testEmailSettings();