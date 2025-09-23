import AdminUser from "../models/AdminUser.js";

// @desc    فحص جميع المستخدمين وحالة التفعيل
// @route   GET /auth/users-status
// @access  Public (للاختبار فقط)
export const getUsersStatus = async (req, res) => {
  try {
    const users = await AdminUser.find({}, {
      password: 0 // عدم إظهار كلمة المرور
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isActive: user.isActive,
        isActivated: user.isActivated,
        hasActivationToken: !!user.activationToken,
        activationTokenExpires: user.activationTokenExpires,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });

  } catch (error) {
    console.error("خطأ في فحص المستخدمين:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في النظام"
    });
  }
};