import { Router, Request, Response } from "express";
import User from "../models/User";

const router = Router();

// Test MongoDB connection and user creation
router.post("/create-user", async (req: Request, res: Response) => {
  try {
    const testUser = new User({
      email: `test-${Date.now()}@ejemplo.com`,
      password: "123456",
      firstName: "Usuario",
      lastName: "Prueba",
      phone: "+56912345678",
      birthDate: new Date("1990-05-15"),
      role: "student",
      plan: "trial",
    });

    const savedUser = await testUser.save();

    res.json({
      success: true,
      message: "Usuario de prueba creado exitosamente",
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
    });
  } catch (error: any) {
    console.error("Test user creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear usuario de prueba",
      error: error.message,
    });
  }
});

// Get all users from database
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password").limit(10);
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
});

export default router;
