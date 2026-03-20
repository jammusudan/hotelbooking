import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect, extractUser } from '../middlewares/authMiddleware.js';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', extractUser, getUserProfile);
router.get('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// OAuth Routes
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'customer';
  console.log(`[OAuth Debug] Starting Google login with role: ${role}`);
  passport.authenticate('google', { scope: ['profile', 'email'], state: role })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('[OAuth Debug] Reached Google callback');
  next();
}, passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
  generateToken(res, req.user._id);
  const redirectUrl = req.user.role === 'admin' ? '/admin' : req.user.role === 'manager' ? '/manager' : '/hotels';
  res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
});

router.get('/github', (req, res, next) => {
  const role = req.query.role || 'customer';
  console.log(`[OAuth Debug] Starting GitHub login with role: ${role}`);
  passport.authenticate('github', { scope: ['user:email'], state: role })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  console.log('[OAuth Debug] Reached GitHub callback');
  console.log('[OAuth Debug] Query details:', req.query);
  next();
}, passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
  generateToken(res, req.user._id);
  const redirectUrl = req.user.role === 'admin' ? '/admin' : req.user.role === 'manager' ? '/manager' : '/hotels';
  res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
});

export default router;
