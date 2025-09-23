import AdminUser from "../models/AdminUser.js";

// @desc    تفعيل جميع الحسابات القديمة
// @route   POST /debug/activate-all
// @access  Public (للصيانة فقط)
export const activateAllOldUsers = async (req, res) => {
  try {
    // تفعيل جميع الحسابات التي لديها lastLogin ولكنها غير مفعلة
    const result = await AdminUser.updateMany(
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

    // تفعيل الحسابات القديمة بناءً على تاريخ الإنشاء
    const oldAccountsResult = await AdminUser.updateMany(
      { 
        createdAt: { $lt: new Date() },
        isActivated: false,
        activationToken: { $exists: false }
      },
      { 
        $set: { 
          isActivated: true,
          isActive: true 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: "تم تفعيل جميع الحسابات القديمة",
      data: {
        loginUsersActivated: result.modifiedCount,
        oldAccountsActivated: oldAccountsResult.modifiedCount,
        totalActivated: result.modifiedCount + oldAccountsResult.modifiedCount
      }
    });

  } catch (error) {
    console.error("خطأ في تفعيل الحسابات:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في النظام"
    });
  }
};