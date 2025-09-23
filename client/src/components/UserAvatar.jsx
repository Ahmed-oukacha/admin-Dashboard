import React from 'react';
import { Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const UserAvatar = ({ user, name, size = 40, fontSize = "1rem", color }) => {
  const theme = useTheme();

  // الحصول على أول حرف من الاسم
  const getInitial = () => {
    // إعطاء الأولوية للـ firstName من authSlice
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    
    // إذا لم يكن هناك firstName، استخدم name أو الـ name المُمرر
    const displayName = name || user?.name;
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    
    return "U"; // افتراضي إذا لم يكن هناك اسم
  };

  // ألوان متنوعة للأفاتار
  const getAvatarColor = (inputName) => {
    const colors = [
      { bg: theme.palette.primary.main, text: theme.palette.primary.contrastText },
      { bg: theme.palette.secondary.main, text: theme.palette.secondary.contrastText },
      { bg: '#FF6B6B', text: '#FFFFFF' },
      { bg: '#4ECDC4', text: '#FFFFFF' },
      { bg: '#45B7D1', text: '#FFFFFF' },
      { bg: '#96CEB4', text: '#FFFFFF' },
      { bg: '#FFEAA7', text: '#2D3436' },
      { bg: '#DDA0DD', text: '#FFFFFF' },
      { bg: '#FF9478', text: '#FFFFFF' },
      { bg: '#6C5CE7', text: '#FFFFFF' }
    ];

    if (!inputName) return colors[0];
    
    // استخدام أول حرف لتحديد اللون
    const charCode = inputName.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    
    return colors[colorIndex];
  };

  const initial = getInitial();
  const displayName = user?.firstName || name || user?.name;
  
  // استخدام اللون المخصص إذا تم توفيره، وإلا استخدام اللون المحفوظ في المستخدم، وإلا استخدام اللون الافتراضي
  const avatarColor = color || user?.avatarColor || getAvatarColor(displayName).bg;

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        backgroundColor: avatarColor,
        color: '#FFFFFF',
        fontSize: fontSize,
        fontWeight: 'bold',
        border: `2px solid ${theme.palette.background.paper}`,
        boxShadow: theme.shadows[2]
      }}
    >
      {initial}
    </Avatar>
  );
};

export default UserAvatar;