import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// نموذج المستخدم (نسخة مبسطة للسكريبت)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user", "super_admin"],
    default: "admin",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const AdminUser = mongoose.model('AdminUser', userSchema);

// دالة لإضافة مستخدم جديد
async function addUser() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/admin');
    console.log('✅ متصل بقاعدة البيانات');

    // بيانات المستخدم الجديد - يمكنك تعديل هذه البيانات
    const userData = {
      firstName: "أحمد",           // غير هذا
      lastName: "محمد",            // غير هذا
      email: "ahmed@example.com",   // غير هذا
      password: "123456",           // غير هذا
      role: "admin",                // يمكن أن يكون: admin, user, super_admin
    };

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await AdminUser.findOne({ email: userData.email });
    if (existingUser) {
      console.log('❌ مستخدم بهذا الإيميل موجود مسبقاً');
      process.exit(1);
    }

    // إنشاء المستخدم الجديد
    const newUser = new AdminUser(userData);
    await newUser.save();

    console.log('✅ تم إنشاء المستخدم بنجاح!');
    console.log('📧 الإيميل:', userData.email);
    console.log('🔑 كلمة المرور:', userData.password);
    console.log('👤 الاسم:', `${userData.firstName} ${userData.lastName}`);
    console.log('🔐 الدور:', userData.role);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
  } finally {
    // قطع الاتصال من قاعدة البيانات
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال من قاعدة البيانات');
    process.exit(0);
  }
}

// تشغيل السكريبت
addUser();

/*
تعليمات الاستخدام:

1. تأكد من وجود ملف .env في مجلد server مع MONGO_URL
2. عدل بيانات المستخدم في السكريبت أعلاه
3. شغل السكريبت من مجلد server:
   node addUser.js

أو يمكنك إضافة سكريبت في package.json:
"add-user": "node addUser.js"

ثم تشغيله:
npm run add-user
*/