import User from "../models/User";
import {
  AppointmentTypeConfig,
  CenterConfiguration,
} from "../models/Configuration";

export async function initializeSeedData() {
  try {
    console.log("🌱 Inicializando datos de prueba...");

    // Check if specific test users exist
    const testEmails = [
      "admin@htkcenter.com",
      "profesor@htkcenter.com",
      "nutri@htkcenter.com",
      "psicologo@htkcenter.com",
      "estudiante@htkcenter.com",
    ];

    const existingTestUsers = await User.find({ email: { $in: testEmails } });
    const missingUsers = testEmails.filter(
      (email) => !existingTestUsers.find((user) => user.email === email),
    );

    if (missingUsers.length > 0) {
      console.log(
        `📝 Creando ${missingUsers.length} usuarios de prueba faltantes...`,
      );
      await createTestUsers();
    } else {
      console.log("🔍 Verificando contraseñas de usuarios existentes...");
      // Check if existing users have proper passwords
      const usersWithoutPassword = await User.find({
        email: { $in: testEmails },
        $or: [
          { password: { $exists: false } },
          { password: null },
          { password: "" },
        ],
      });

      if (usersWithoutPassword.length > 0) {
        console.log(
          `🔧 Recreando ${usersWithoutPassword.length} usuarios sin contraseña...`,
        );
        // Delete users without proper passwords and recreate them
        await User.deleteMany({
          email: { $in: usersWithoutPassword.map((u) => u.email) },
        });
        await createTestUsers();
      } else {
        // Even if passwords exist, verify they work by testing one
        const testUser = await User.findOne({ email: testEmails[0] });
        if (testUser) {
          const passwordTest = await testUser.comparePassword("admin123");
          if (!passwordTest) {
            console.log(
              "🔧 Las contraseñas existentes no funcionan, recreando usuarios...",
            );
            await User.deleteMany({ email: { $in: testEmails } });
            await createTestUsers();
          } else {
            console.log(
              "✅ Todos los usuarios de prueba tienen contraseñas válidas",
            );
          }
        }
      }
    }

    // Always update existing users to ensure they have new fields
    console.log("👥 Verificando y actualizando usuarios existentes...");
    await updateExistingUsers();

    // Check and create configurations
    const existingConfigs = await CenterConfiguration.countDocuments();
    if (existingConfigs === 0) {
      console.log("⚙️ Creando configuraciones del centro...");
      await createConfigurations();
    }

    console.log("✅ Datos de prueba inicializados correctamente");
  } catch (error) {
    console.error("❌ Error inicializando datos de prueba:", error);
  }
}

async function createTestUsers() {
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
    maxStudentsPerClass: 1,
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
    maxStudentsPerClass: 1,
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

  // Save all users properly to ensure password hashing
  const users = [admin, teacher, nutritionist, psychologist, student];

  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        // Create new user - this will trigger password hashing
        await user.save();
        console.log(`✅ Usuario creado: ${user.email}`);
      } else {
        // Update existing user but preserve existing password if it exists
        existingUser.firstName = user.firstName;
        existingUser.lastName = user.lastName;
        existingUser.role = user.role;
        existingUser.specialty = user.specialty;
        existingUser.workingHours = user.workingHours;
        existingUser.maxClassesPerDay = user.maxClassesPerDay;
        existingUser.maxStudentsPerClass = user.maxStudentsPerClass;

        // Only update password if the existing user doesn't have one
        if (!existingUser.password) {
          existingUser.password = user.password; // This will trigger hashing on save
        }

        await existingUser.save();
        console.log(`🔄 Usuario actualizado: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando usuario ${user.email}:`, error);
    }
  }

  console.log("✅ Usuarios de prueba creados:");
  console.log("   👨‍💼 Admin: admin@htkcenter.com / admin123");
  console.log("   🏋️ Profesor: profesor@htkcenter.com / profesor123");
  console.log("   🥗 Nutri: nutri@htkcenter.com / nutri123");
  console.log("   🧠 Psicólogo: psicologo@htkcenter.com / psicologo123");
  console.log("   👤 Estudiante: estudiante@htkcenter.com / estudiante123");
}

async function updateExistingUsers() {
  // Update existing users to have new fields if they don't exist
  const users = await User.find({});

  for (const user of users) {
    let needsUpdate = false;

    // Add missing professional fields
    if (
      (user.role === "teacher" ||
        user.role === "nutritionist" ||
        user.role === "psychologist") &&
      !user.workingHours
    ) {
      user.workingHours = {
        start: "09:00",
        end: "18:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      };
      needsUpdate = true;
    }

    // Add missing student plan fields
    if (user.role === "student") {
      if (!user.totalClasses && user.plan) {
        const planMapping = {
          basic: { total: 8, monthly: 8 },
          pro: { total: 12, monthly: 12 },
          elite: { total: 16, monthly: 16 },
          personalized: { total: 20, monthly: 20 },
        };

        const planConfig = planMapping[user.plan as keyof typeof planMapping];
        if (planConfig) {
          user.totalClasses = planConfig.total;
          user.maxMonthlyClasses = planConfig.monthly;
          user.usedClasses = 0;
          user.remainingClasses = planConfig.total;
          user.planStartDate = new Date();
          user.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      await user.save();
    }
  }

  console.log("✅ Usuarios existentes actualizados");
}

async function createConfigurations() {
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
  ];

  // Create center configuration
  const centerConfig = new CenterConfiguration();

  // Save appointment types and configuration
  await AppointmentTypeConfig.insertMany(appointmentTypes);
  await centerConfig.save();

  console.log("✅ Configuraciones del centro creadas");
}
