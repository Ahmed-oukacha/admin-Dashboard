/**
 * Script لإضافة مستخدمين إداريين متعددين
 * يمكن تخصيص البيانات حسب الحاجة
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import AdminUser from "./models/AdminUser.js";

// Charger les variables d'environnement
dotenv.config();

const createMultipleAdmins = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connexion à MongoDB établie");

    // قائمة المستخدمين المراد إضافتهم
    const usersToCreate = [
      {
        email: "admin@asksource.com",
        password: "admin123456",
        firstName: "Admin",
        lastName: "Principal",
        role: "superadmin",
        isActive: true
      },
      {
        email: "manager@asksource.com", 
        password: "manager123456",
        firstName: "مدير",
        lastName: "النظام",
        role: "admin",
        isActive: true
      },
      {
        email: "user@asksource.com",
        password: "user123456", 
        firstName: "مستخدم",
        lastName: "عادي",
        role: "admin",
        isActive: true
      }
      // يمكن إضافة المزيد هنا...
    ];

    console.log(`🔄 محاولة إنشاء ${usersToCreate.length} مستخدم(ين)...`);

    for (const userData of usersToCreate) {
      try {
        // التحقق من وجود المستخدم
        const existingUser = await AdminUser.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  المستخدم ${userData.email} موجود بالفعل`);
          continue;
        }

        // إنشاء المستخدم الجديد
        const newUser = new AdminUser(userData);
        await newUser.save();

        console.log(`✅ تم إنشاء المستخدم: ${userData.email}`);
        console.log(`   👤 الاسم: ${userData.firstName} ${userData.lastName}`);
        console.log(`   🔑 كلمة المرور: ${userData.password}`);
        console.log(`   🛡️  الدور: ${userData.role === 'superadmin' ? 'مدير عام' : 'مدير'}`);
        console.log(`   ────────────────────────────────────`);

      } catch (userError) {
        console.error(`❌ خطأ في إنشاء المستخدم ${userData.email}:`, userError.message);
      }
    }

    console.log("🎉 انتهت عملية إنشاء المستخدمين!");

  } catch (error) {
    console.error("❌ خطأ عام:", error);
  } finally {
    // إغلاق الاتصال
    await mongoose.connection.close();
    console.log("🔌 تم إغلاق الاتصال");
  }
};

// تشغيل Script
createMultipleAdmins();