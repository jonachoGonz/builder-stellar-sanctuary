import express from "express";
import User from "../models/User";
import {
  AppointmentTypeConfig,
  CenterConfiguration,
} from "../models/Configuration";

const router = express.Router();

// Seed test users
router.post("/users", async (req, res) => {
  try {
    // Clear existing test users (optional - only for development)
    await User.deleteMany({ email: { $regex: /test.*@htkcenter\.com/ } });

    // Admin user
    const admin = new User({
      email: "admin@htkcenter.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "HTK Center",
      phone: "+56994748507",
      birthDate: new Date("1985-05-15"),
      role: "admin",
      memberSince: new Date("2023-01-01"),
      isActive: true,
      permissions: ["all"],
    });

    // Profesor/Entrenador
    const teacher = new User({
      email: "profesor@htkcenter.com",
      password: "profesor123",
      firstName: "Carlos",
      lastName: "Mendoza",
      phone: "+56998765432",
      birthDate: new Date("1988-03-20"),
      role: "teacher",
      specialty: "Entrenamiento Funcional y CrossFit",
      memberSince: new Date("2023-02-01"),
      isActive: true,
      workingHours: {
        start: "08:00",
        end: "20:00",
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
      },
      maxClassesPerDay: 8,
      maxStudentsPerClass: 15,
      assignedStudents: [],
    });

    // Nutricionista
    const nutritionist = new User({
      email: "nutri@htkcenter.com",
      password: "nutri123",
      firstName: "María",
      lastName: "González",
      phone: "+56987654321",
      birthDate: new Date("1990-07-12"),
      role: "nutritionist",
      specialty: "Nutrición Deportiva y Clínica",
      memberSince: new Date("2023-03-01"),
      isActive: true,
      workingHours: {
        start: "09:00",
        end: "18:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      },
      maxClassesPerDay: 10,
      maxStudentsPerClass: 1, // Individual sessions
      assignedStudents: [],
    });

    // Psicólogo
    const psychologist = new User({
      email: "psicologo@htkcenter.com",
      password: "psicologo123",
      firstName: "Ana",
      lastName: "Silva",
      phone: "+56976543210",
      birthDate: new Date("1987-11-28"),
      role: "psychologist",
      specialty: "Psicología Deportiva y del Bienestar",
      memberSince: new Date("2023-04-01"),
      isActive: true,
      workingHours: {
        start: "10:00",
        end: "19:00",
        days: ["tuesday", "wednesday", "thursday", "friday", "saturday"],
      },
      maxClassesPerDay: 8,
      maxStudentsPerClass: 1, // Individual sessions
      assignedStudents: [],
    });

    // Estudiante de prueba
    const student = new User({
      email: "estudiante@htkcenter.com",
      password: "estudiante123",
      firstName: "Juan",
      lastName: "Pérez",
      phone: "+56965432109",
      birthDate: new Date("1995-09-10"),
      role: "student",
      plan: "pro",
      planDuration: 1,
      totalClasses: 12,
      usedClasses: 3,
      remainingClasses: 9,
      maxMonthlyClasses: 12,
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      memberSince: new Date(),
      isActive: true,
      activityLevel: "active",
      emergencyContact: {
        name: "María Pérez",
        phone: "+56954321098",
      },
    });

    // Save all users
    const savedUsers = await Promise.all([
      admin.save(),
      teacher.save(),
      nutritionist.save(),
      psychologist.save(),
      student.save(),
    ]);

    res.json({
      message: "Test users created successfully",
      users: savedUsers.map((user) => ({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.getFullName(),
      })),
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ error: "Failed to create test users" });
  }
});

// Seed appointment types and configurations
router.post("/config", async (req, res) => {
  try {
    // Clear existing configurations
    await AppointmentTypeConfig.deleteMany({});
    await CenterConfiguration.deleteMany({});

    // Create appointment types
    const appointmentTypes = [
      {
        name: "Clase de Prueba",
        code: "trial-class",
        duration: 60,
        description: "Primera clase gratuita para nuevos estudiantes",
        professionalTypes: ["teacher"],
        color: "#10B981",
        maxParticipants: 1,
      },
      {
        name: "Entrenamiento Personal",
        code: "personal-training",
        duration: 60,
        description: "Sesión de entrenamiento personalizado",
        professionalTypes: ["teacher"],
        color: "#3B82F6",
        maxParticipants: 1,
      },
      {
        name: "Entrenamiento + Kinesiología",
        code: "training-kinesiology",
        duration: 90,
        description: "Sesión combinada de entrenamiento y kinesiología",
        professionalTypes: ["teacher"],
        color: "#8B5CF6",
        maxParticipants: 1,
      },
      {
        name: "Primera Sesión de Nutrición",
        code: "first-nutrition",
        duration: 90,
        description: "Evaluación nutricional inicial y plan personalizado",
        professionalTypes: ["nutritionist"],
        color: "#F59E0B",
        maxParticipants: 1,
      },
      {
        name: "Seguimiento Nutricional",
        code: "nutrition-followup",
        duration: 45,
        description: "Sesión de seguimiento y ajuste del plan nutricional",
        professionalTypes: ["nutritionist"],
        color: "#F97316",
        maxParticipants: 1,
      },
      {
        name: "Sesión de Psicología",
        code: "psychology-session",
        duration: 60,
        description: "Sesión de apoyo psicológico y bienestar mental",
        professionalTypes: ["psychologist"],
        color: "#EC4899",
        maxParticipants: 1,
      },
      {
        name: "Clase Grupal",
        code: "group-class",
        duration: 60,
        description: "Clase grupal de entrenamiento",
        professionalTypes: ["teacher"],
        color: "#06B6D4",
        maxParticipants: 15,
      },
      {
        name: "Evaluación Física",
        code: "evaluation",
        duration: 45,
        description: "Evaluación física y de composición corporal",
        professionalTypes: ["teacher", "nutritionist"],
        color: "#6366F1",
        maxParticipants: 1,
      },
    ];

    // Create center configuration
    const centerConfig = new CenterConfiguration();

    // Save appointment types
    const savedTypes = await AppointmentTypeConfig.insertMany(appointmentTypes);
    const savedConfig = await centerConfig.save();

    res.json({
      message: "Configuration created successfully",
      appointmentTypes: savedTypes.length,
      centerConfiguration: savedConfig._id,
    });
  } catch (error) {
    console.error("Error creating configuration:", error);
    res.status(500).json({ error: "Failed to create configuration" });
  }
});

// Get all seed data
router.get("/status", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const appointmentTypesCount = await AppointmentTypeConfig.countDocuments();
    const configCount = await CenterConfiguration.countDocuments();

    const users = await User.find(
      { email: { $regex: /.*@htkcenter\.com/ } },
      { email: 1, role: 1, firstName: 1, lastName: 1 },
    );

    res.json({
      userCount,
      appointmentTypesCount,
      configCount,
      testUsers: users,
    });
  } catch (error) {
    console.error("Error getting seed status:", error);
    res.status(500).json({ error: "Failed to get seed status" });
  }
});

export default router;
