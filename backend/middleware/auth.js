import bcrypt from 'bcrypt';

export async function authenticateAdmin(req, res, next) {
  if (req.session?.adminAuthenticated) {
    return next();
  }

  const { password } = req.body;
  const hashedPassword = process.env.ADMIN_PASSWORD;

  if (!hashedPassword) {
    console.error('ADMIN_PASSWORD не установлен в .env');
    return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }

  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Ошибка регенерации сессии:', err);
          return res.status(500).json({ success: false });
        }
        req.session.adminAuthenticated = true;
        return next();
      });
    } else {
      console.log(`Неудачная попытка входа с IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Неверный пароль'
      });
    }
  } catch (err) {
    console.error('Ошибка при проверке пароля:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка аутентификации'
    });
  }
}

export function logoutAdmin(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ success: false });
    }
    res.clearCookie('northbridge.sid', {
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    });
    return res.json({ success: true });
  });
}

export function checkSession(req, res, next) {
  if (req.session?.adminAuthenticated) {
    return next();
  }

  return res.redirect('/admin-login');
}