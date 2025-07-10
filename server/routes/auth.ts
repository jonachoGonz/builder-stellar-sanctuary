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

    console.log(`🔐 Login attempt for: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    console.log(
      `👤 User found: ${user.email}, Role: ${user.role}, Has password: ${!!user.password}`,
    );

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`🔑 Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`❌ Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    console.log(`✅ Login successful for: ${email}`);

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

// Google OAuth routes - only if properly configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "placeholder_client_id"
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
    res.status(501).json({
      success: false,
      message: "Google OAuth no está configurado en el servidor",
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

// Temporary endpoint to fix user passwords (for debugging)
router.post("/fix-test-users", async (req: Request, res: Response) => {
  try {
    console.log("🔧 Fixing test users...");

    const testUsers = [
      {
        email: "admin@htkcenter.com",
        password: "admin123",
        role: "admin",
        firstName: "Admin",
        lastName: "HTK Center",
      },
      {
        email: "profesor@htkcenter.com",
        password: "profesor123",
        role: "teacher",
        firstName: "Carlos",
        lastName: "Mendoza",
      },
      {
        email: "nutri@htkcenter.com",
        password: "nutri123",
        role: "nutritionist",
        firstName: "María",
        lastName: "González",
      },
      {
        email: "psicologo@htkcenter.com",
        password: "psicologo123",
        role: "psychologist",
        firstName: "Ana",
        lastName: "Silva",
      },
      {
        email: "estudiante@htkcenter.com",
        password: "estudiante123",
        role: "student",
        firstName: "Juan",
        lastName: "Pérez",
      },
    ];

    // Delete existing test users
    await User.deleteMany({ email: { $in: testUsers.map((u) => u.email) } });

    // Create new users with proper password hashing
    for (const userData of testUsers) {
      const user = new User({
        ...userData,
        phone: "+56994748507",
        birthDate: new Date("1990-01-01"),
        memberSince: new Date(),
        isActive: true,
      });

      await user.save(); // This will trigger password hashing
      console.log(`✅ Usuario recreado: ${user.email}`);
    }

    res.json({
      success: true,
      message: "Test users recreated with proper password hashing",
    });
  } catch (error) {
    console.error("Error fixing test users:", error);
    res.status(500).json({
      success: false,
      message: "Error fixing test users",
    });
  }
});

export default router;
