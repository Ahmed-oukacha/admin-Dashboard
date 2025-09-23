import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createQuickAdmin = async () => {
  try {
    console.log("🔄 محاولة الاتصال بـ MongoDB...");
    console.log("📍 URL:", process.env.MONGO_URL);
    
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ تم الاتصال بـ MongoDB بنجاح!");

    // إنشاء المستخدم مباشرة
    const AdminUserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, default: "admin" },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    // إضافة method لتشفير كلمة المرور
    AdminUserSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

    // التحقق من وجود المستخدم
    const existingUser = await AdminUser.findOne({ email: "admin@asksource.com" });
    
    if (existingUser) {
      console.log("⚠️  المستخدم موجود بالفعل!");
      console.log("📧 Email: admin@asksource.com");
      console.log("🔑 Password: admin123456");
      return;
    }

    // إنشاء المستخدم
    const newAdmin = new AdminUser({
      email: "admin@asksource.com",
      password: "admin123456",
      firstName: "Admin",
      lastName: "Asksource",
      role: "superadmin",
      isActive: true
    });

    await newAdmin.save();

    console.log("🎉 تم إنشاء المستخدم بنجاح!");
    console.log("📧 Email: admin@asksource.com");
    console.log("🔑 Password: admin123456");

  } catch (error) {
    console.error("❌ خطأ:", error.message);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.log("⚠️  المستخدم موجود بالفعل (خطأ في الفهرس الفريد)");
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("🔌 تم إغلاق الاتصال");
    }
  }
};

createQuickAdmin();