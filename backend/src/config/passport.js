import dotenv from 'dotenv';
dotenv.config();

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

/* ================= GOOGLE STRATEGY ================= */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL?.trim();

console.log('[Google OAuth Debug] Configuration initialized:');
console.log(`- API URL: ${GOOGLE_CALLBACK_URL}`);
console.log(`- Client ID: ${GOOGLE_CLIENT_ID?.substring(0, 15)}...`);
console.log(`- Secret Length: ${GOOGLE_CLIENT_SECRET?.length || 0}`);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log(`[Google OAuth] Login attempt: ${profile.emails[0].value}`);

        let user = await User.findOne({ googleId: profile.id });

        // Existing Google user
        if (user) {
          if (user.email === 'admin@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
          }
          return done(null, user);
        }

        // Email already exists
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;

          if (user.email === 'admin@gmail.com') {
            user.role = 'admin';
          }

          await user.save();
          return done(null, user);
        }

        // Create new user
        const selectedRole = req.query.state || 'customer';

        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-8),
          googleId: profile.id,
          avatar: profile.photos[0].value,
          role:
            profile.emails[0].value === 'admin@gmail.com'
              ? 'admin'
              : selectedRole,
          isEmailVerified: true,
        });

        return done(null, newUser);
      } catch (err) {
        console.error('[Google OAuth Error]', err);
        return done(err, null);
      }
    }
  )
);

/* ================= GITHUB STRATEGY ================= */

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim();
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET?.trim();
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL?.trim();

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('[Passport GitHub Debug] Profile received:', profile.id, profile.username);
        let user = await User.findOne({ githubId: profile.id });

        if (user) return done(null, user);

        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

        user = await User.findOne({ email });

        if (user) {
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        const selectedRole = req.query.state || 'customer';

        const newUser = await User.create({
          name: profile.displayName || profile.username,
          email,
          password: Math.random().toString(36).slice(-8),
          githubId: profile.id,
          avatar: profile._json.avatar_url,
          role: selectedRole,
          isEmailVerified: true,
        });

        return done(null, newUser);
      } catch (err) {
        console.error('[GitHub OAuth Error]', err);
        return done(err, null);
      }
    }
  )
);

/* ================= SESSION ================= */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;