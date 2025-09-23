/**
 * Script لتشفير كلمة مرور جديدة
 * استخدمه للحصول على كلمة مرور مُشفرة
 */

import bcrypt from "bcryptjs";

const generateHashedPassword = async (plainPassword) => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log("🔑 كلمة المرور الأصلية:", plainPassword);
    console.log("🔐 كلمة المرور المُشفرة:", hashedPassword);
    console.log("\n📋 للنسخ واللصق في Studio 3T:");
    console.log(`"password": "${hashedPassword}"`);
    
  } catch (error) {
    console.error("❌ خطأ في تشفير كلمة المرور:", error);
  }
};

// غيّر كلمة المرور هنا
const passwordToHash = "mypassword123";

generateHashedPassword(passwordToHash);