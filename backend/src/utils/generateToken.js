import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role = '') => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieName = role ? `jwt_${role}` : 'jwt';

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: true, // MUST be true for cross-site (Render over HTTPS)
    sameSite: 'none', // MUST be 'none' for Vercel -> Render cross-site
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
