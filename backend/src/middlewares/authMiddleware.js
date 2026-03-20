import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
const protect = async (req, res, next) => {
  let token;
  const activeRole = req.headers['x-active-role'] || req.query.activeRole;

  if (activeRole && req.cookies[`jwt_${activeRole}`]) {
    token = req.cookies[`jwt_${activeRole}`];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token, exclude password
      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      next(
        new Error(
          `User role '${req.user.role}' is not authorized to access this route`
        )
      );
    }
    next();
  };
};

// Extract user from token if present (optional auth)
const extractUser = async (req, res, next) => {
  const activeRole = req.headers['x-active-role'] || req.query.activeRole;
  let token;

  if (activeRole && req.cookies[`jwt_${activeRole}`]) {
    token = req.cookies[`jwt_${activeRole}`];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      // Ignore errors for optional auth
    }
  }
  next();
};

const admin = authorize('admin');

export { protect, authorize, admin, extractUser };
