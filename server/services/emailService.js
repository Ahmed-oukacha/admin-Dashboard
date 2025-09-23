import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// إعداد النقل للإيميل
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

// دالة إرسال إيميل التفعيل للأدمين
export const sendActivationEmailToAdmin = async (userEmail, userName, activationToken) => {
  // الرابط يذهب مباشرة للخادم وليس للعميل
  const activationUrl = `${process.env.SERVER_URL || 'http://localhost:5001'}/auth/activate/${activationToken}`;
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL, // إيميلك
    subject: '🔔 Nouvelle demande d\'inscription - Asksource Admin Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Nouvelle demande d'inscription</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Asksource Admin Dashboard</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Détails de la demande :</h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Nom :</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Email :</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Date de demande :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              ✅ Activer le compte
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;">
              <strong>Note :</strong> En cliquant sur "Activer le compte", cet utilisateur sera activé et pourra se connecter au système.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>Cet email a été envoyé automatiquement par le système Asksource Admin Dashboard</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email d\'activation envoyé à l\'administrateur avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// دالة إرسال إيميل تأكيد للمستخدم
export const sendConfirmationToUser = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: '✅ Demande d\'inscription reçue - Asksource Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Merci ${userName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Demande d'inscription reçue avec succès</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Statut de votre demande :</h2>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
            <p style="margin: 0; color: #1976d2; font-size: 18px;">
              ⏳ <strong>En attente de révision</strong>
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Votre demande d'inscription au système Asksource Admin Dashboard a été reçue. 
            Votre demande sera examinée par l'administrateur et vous recevrez une notification lors de l'activation de votre compte.
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #495057;">
              <strong>Note :</strong> Le processus de révision peut prendre de quelques minutes à quelques heures.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>Cet email a été envoyé automatiquement par le système Asksource Admin Dashboard</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé à l\'utilisateur avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return false;
  }
};