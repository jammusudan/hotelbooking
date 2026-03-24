import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Role can be passed in request, but typically admins would create other managers/admins
    // For this scope, we let user register as customer or manager
    const userRole = role === 'manager' ? 'manager' : 'customer';

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      verificationToken,
    });

    if (user) {
      // Send verification email
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      const message = `Please verify your email by clicking: \n\n ${verifyUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification',
          message,
          html: `<p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
        });
      } catch (err) {
        console.error('Email could not be sent', err);
      }

      generateToken(res, user._id, user.role);

      // Emit socket event to notify admins
      const io = req.app.get('socketio');
      if (io) {
          io.to('admin_room').emit('new_user_alert', {
              name: user.name,
              role: user.role
          });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id, user.role);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    const activeRole = req.headers['x-active-role'] || req.query.activeRole;
    const cookieName = activeRole ? `jwt_${activeRole}` : 'jwt';

    res.cookie(cookieName, '', {
      httpOnly: true,
      expires: new Date(0),
    });

    // Also clear the fallback generic cookie to ensure complete logout
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json(null);
    }
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
        html: `<p>Please reset your password by clicking the link below:</p><a href="${resetUrl}">${resetUrl}</a>`,
      }, true);

      res.status(200).json({ message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, logoutUser, getUserProfile, verifyEmail, forgotPassword, resetPassword };
