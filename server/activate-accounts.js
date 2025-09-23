import mongoose from "mongoose";
import AdminUser from "./models/AdminUser.js";
import dotenv from "dotenv";

dotenv.config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// تفعيل جميع الحسابات القديمة
async function activateOldAccounts() {
  try {
    console.log("🔄 بدء تفعيل الحسابات القديمة...");
    
    // تفعيل الحسابات التي لديها lastLogin
    const result1 = await AdminUser.updateMany(
      { 
        lastLogin: { $exists: true },
        isActivated: false 
      },
      { 
        $set: { 
          isActivated: true,
          isActive: true 
        } 
      }
    );

    // تفعيل الحسابات القديمة (بدون activation token)
    const result2 = await AdminUser.updateMany(
      { 
        isActivated: false,
        $or: [
          { activationToken: { $exists: false } },
          { activationToken: null }
        ]
      },
      { 
        $set: { 
          isActivated: true,
          isActive: true 
        } 
      }
    );

    console.log(`✅ تم تفعيل ${result1.modifiedCount} حساب من الحسابات المستخدمة`);
    console.log(`✅ تم تفعيل ${result2.modifiedCount} حساب من الحسابات القديمة`);
    console.log(`🎉 إجمالي الحسابات المفعلة: ${result1.modifiedCount + result2.modifiedCount}`);
    
    // عرض الحسابات بعد التفعيل
    const users = await AdminUser.find({}, { password: 0 }).sort({ createdAt: -1 });
    console.log("\n📋 حالة الحسابات بعد التفعيل:");
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}): ${user.isActivated ? '✅ مفعل' : '❌ غير مفعل'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ خطأ في تفعيل الحسابات:", error);
    process.exit(1);
  }
}

activateOldAccounts();