import AdminUser from '../models/AdminUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Texte d'erreur en français
const ERROR_MSG = {
  userNotFound: "Adresse e-mail ou mot de passe incorrect.",
  invalidPassword: "Adresse e-mail ou mot de passe incorrect.",
  server: "Erreur serveur. Veuillez réessayer plus tard."
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('محاولة تسجيل دخول:', { email, password: '***' });
  
  try {
    const user = await AdminUser.findOne({ email });
    console.log('المستخدم الموجود:', user ? 'موجود' : 'غير موجود');
    
    if (!user) {
      return res.status(401).json({ message: ERROR_MSG.userNotFound });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('مطابقة كلمة المرور:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: ERROR_MSG.invalidPassword });
    }
    
    // Générer le JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'votre_jwt_secret',
      { expiresIn: '1d' }
    );
    
    console.log('تم إنشاء التوكن بنجاح');
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    console.error('خطأ في تسجيل الدخول:', err);
    res.status(500).json({ message: ERROR_MSG.server });
  }
};
