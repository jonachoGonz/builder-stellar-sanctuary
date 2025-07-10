import mongoose from "mongoose";
import User from "../models/User";
import { connectDB } from "../config/database";

async function testUsers() {
  try {
    await connectDB();

    console.log("🔍 Verificando usuarios en la base de datos...");

    const users = await User.find({}, "email role firstName lastName");

    console.log(`📊 Total de usuarios: ${users.length}`);
    console.log("\n👥 Lista de usuarios:");

    users.forEach((user) => {
      console.log(
        `   ${user.role.toUpperCase()}: ${user.email} - ${user.firstName} ${user.lastName}`,
      );
    });

    // Test login credentials
    console.log("\n🔑 Credenciales de prueba disponibles:");
    console.log("   admin@htkcenter.com / admin123");
    console.log("   profesor@htkcenter.com / profesor123");
    console.log("   nutri@htkcenter.com / nutri123");
    console.log("   psicologo@htkcenter.com / psicologo123");
    console.log("   estudiante@htkcenter.com / estudiante123");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testUsers();
