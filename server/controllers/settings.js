import AdminUser from "../models/AdminUser.js";
import bcrypt from "bcrypt";

// تحديث معلومات المستخدم
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, avatarColor } = req.body;

    console.log("Update request:", { userId, name, email, avatarColor });

    // التحقق من وجود المستخدم
    const user = await AdminUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // التحقق من أن الإيميل غير مستخدم من قبل مستخدم آخر
    if (email && email !== user.email) {
      const existingUser = await AdminUser.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل" });
      }
    }

    // تحديث البيانات
    const updateData = {};
    
    // تحديث الاسم (تقسيم إلى firstName و lastName)
    if (name) {
      const nameParts = name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if (email) updateData.email = email;
    if (avatarColor) updateData.avatarColor = avatarColor;

    const updatedUser = await AdminUser.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: "-password" }
    );

    res.status(200).json({
      message: "تم تحديث الملف الشخصي بنجاح",
      user: updatedUser
    });
  } catch (error) {
    console.error("خطأ في تحديث الملف الشخصي:", error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
};

// تغيير كلمة المرور
const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // التحقق من وجود المستخدم
    const user = await AdminUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    // التحقق من قوة كلمة المرور الجديدة
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل" });
    }

    // تشفير كلمة المرور الجديدة
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // تحديث كلمة المرور
    await AdminUser.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    console.error("خطأ في تغيير كلمة المرور:", error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
};

export { updateUserProfile, changePassword };