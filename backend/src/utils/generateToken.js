import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role = '') => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieName = role ? `jwt_${role}` : 'jwt';

  // Set JWT as an HTTP-Only cookie
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
