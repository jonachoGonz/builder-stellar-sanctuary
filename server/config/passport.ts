import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Only configure Google OAuth if credentials are provided
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "placeholder_client_id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "GOCSPX-your_client_secret_here"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_BASE_URL || "http://localhost:3001"}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with this email
          user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0].value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            avatar: profile.photos?.[0].value,
            phone: "Por completar", // Will be required to complete profile later
            birthDate: new Date("1990-01-01"), // Default, will be required to complete
            role: "student",
            plan: "trial",
            isActive: true,
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          console.error("Google OAuth error:", error);
          done(error, null);
        }
      },
    ),
  );
} else {
  console.log("⚠️ Google OAuth not configured - using placeholder credentials");
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
