import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role = '') => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieName = role ? `jwt_${role}` : 'jwt';

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // True in production
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // Must be 'none' for cross-site (Vercel->Render)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
