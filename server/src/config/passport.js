const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

console.log(
  "Google Client ID loaded:",
  !!process.env.GOOGLE_CLIENT_ID
);

console.log(
  "Google Client Secret loaded:",
  !!process.env.GOOGLE_CLIENT_SECRET
);

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback",
  },

  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile received:", profile.displayName);

      const email = profile.emails?.[0]?.value;

      if (!email) {
        console.error("Google account did not provide an email");
        return done(null, false);
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: email,
          password: `google_${profile.id}_${Date.now()}`,
          profilePic: profile.photos?.[0]?.value || "",
        });

        console.log("New Google user created:", email);
      } else {
        console.log("Existing Google user found:", email);
      }

      return done(null, user);
    } catch (error) {
      console.error("Google user processing error:", error);
      return done(error, null);
    }
  }
);

// Capture errors during Google's OAuth token exchange
googleStrategy.error = (error) => {
  console.error("========== GOOGLE OAUTH ERROR ==========");
  console.error("Error:", error);
  console.error("Message:", error?.message);
  console.error("Response:", error?.response);
  console.error("========================================");
};

passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;