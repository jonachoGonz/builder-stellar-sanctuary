import { Router, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";
import passport from "../config/passport";

const router = Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "htk-center-secret";
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

// Register with email/password
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      birthDate,
      gender,
      occupation,
      activityLevel,
      medicalConditions,
      injuries,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe con este email",
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      birthDate: new Date(birthDate),
      gender,
      occupation,
      activityLevel,
      medicalConditions,
      injuries,
      emergencyContact:
        emergencyContactName && emergencyContactPhone
          ? {
              name: emergencyContactName,
              phone: emergencyContactPhone,
            }
          : undefined,
      role: "student",
      plan: "trial",
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Login with email/password
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Login attempt:", { email, password: "***" });

    // Find user by email
    const user = await User.findOne({ email });
    console.log("📊 User found:", user ? { id: user._id, email: user.email, hasPassword: !!user.password } : "No user found");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Google OAuth configuration status endpoint
router.get("/google/status", (req: Request, res: Response) => {
  const isConfigured =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "placeholder_client_id" &&
    process.env.GOOGLE_CLIENT_SECRET !== "GOCSPX-your_client_secret_here";

  res.json({
    success: true,
    configured: isConfigured,
    clientId: process.env.GOOGLE_CLIENT_ID || "Not set",
    hasSecret: !!(
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET !== "GOCSPX-your_client_secret_here"
    ),
    message: isConfigured
      ? "Google OAuth está configurado correctamente"
      : "Google OAuth necesita configuración adicional",
  });
});

// Google OAuth routes - only if properly configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "placeholder_client_id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "GOCSPX-your_client_secret_here"
) {
  // Google OAuth login
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  // Google OAuth callback
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user) {
          console.error("No user returned from Google OAuth");
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=oauth_no_user`,
          );
        }

        // Generate token
        const token = generateToken(user._id.toString());

        // Redirect to frontend with token
        res.redirect(
          `${process.env.CLIENT_URL}/auth/success?token=${token}&user=${encodeURIComponent(
            JSON.stringify({
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              plan: user.plan,
              avatar: user.avatar,
            }),
          )}`,
        );
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
      }
    },
  );
} else {
  // Provide fallback routes when Google OAuth is not configured
  router.get("/google", (req: Request, res: Response) => {
    const missingConfig = [];
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID === "placeholder_client_id"
    ) {
      missingConfig.push("GOOGLE_CLIENT_ID");
    }
    if (
      !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET === "GOCSPX-your_client_secret_here"
    ) {
      missingConfig.push("GOOGLE_CLIENT_SECRET");
    }

    res.status(501).json({
      success: false,
      message: "Google OAuth no está completamente configurado",
      missingConfig,
      instructions: "Por favor configura las variables de entorno faltantes",
    });
  });

  router.get("/google/callback", (req: Request, res: Response) => {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
  });
}

// Get current user profile
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.userId).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        birthDate: user.birthDate,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
        gender: user.gender,
        occupation: user.occupation,
        activityLevel: user.activityLevel,
        medicalConditions: user.medicalConditions,
        injuries: user.injuries,
        emergencyContact: user.emergencyContact,
        memberSince: user.memberSince,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.role;
      delete updateData.googleId;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Perfil actualizado exitosamente",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          birthDate: user.birthDate,
          role: user.role,
          plan: user.plan,
          avatar: user.avatar,
          gender: user.gender,
          occupation: user.occupation,
          activityLevel: user.activityLevel,
          medicalConditions: user.medicalConditions,
          injuries: user.injuries,
          emergencyContact: user.emergencyContact,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Middleware to authenticate JWT token
export function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token inválido",
      });
    }

    (req as any).user = user;
    next();
  });
}

export default router;
