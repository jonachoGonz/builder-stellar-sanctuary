import mongoose from "mongoose";
import User from "../models/User";
import PlanUsuario from "../models/PlanUsuario";

// Script para inicializar planes para usuarios existentes
export async function initializeUserPlans() {
  try {
    console.log("🚀 Inicializando planes para usuarios existentes...");

    // Buscar todos los estudiantes que no tienen plan
    const estudiantes = await User.find({ role: "student" });

    for (const estudiante of estudiantes) {
      // Verificar si ya tiene un plan
      const planExistente = await PlanUsuario.findOne({
        userId: estudiante._id,
      });

      if (!planExistente) {
        // Determinar el tipo de plan basado en el plan del usuario
        let tipoPlan = "trial";
        if (estudiante.plan) {
          tipoPlan = estudiante.plan;
        }

        // Crear el plan usando el método estático
        await PlanUsuario.inicializarPlan(estudiante._id, tipoPlan);

        console.log(
          `✅ Plan ${tipoPlan} creado para ${estudiante.firstName} ${estudiante.lastName}`,
        );
      } else {
        console.log(
          `⚡ Plan ya existe para ${estudiante.firstName} ${estudiante.lastName}`,
        );
      }
    }

    console.log("🎉 Inicialización de planes completada");
  } catch (error) {
    console.error("❌ Error al inicializar planes:", error);
  }
}

// Script para migrar citas existentes a la nueva estructura
export async function migrateExistingAppointments() {
  try {
    console.log("🔄 Migrando citas existentes al nuevo sistema...");

    const Appointment = mongoose.model("Appointment");
    const Agenda = mongoose.model("Agenda");

    // Buscar todas las citas existentes
    const appointments = await Appointment.find({});

    for (const appointment of appointments) {
      // Verificar si ya existe en la nueva estructura
      const agendaExistente = await Agenda.findOne({
        alumnoId: appointment.student,
        profesionalId: appointment.professional,
        fecha: appointment.date,
        hora: appointment.startTime,
      });

      if (!agendaExistente) {
        // Migrar a la nueva estructura
        const nuevaClase = new Agenda({
          alumnoId: appointment.student,
          profesionalId: appointment.professional,
          fecha: appointment.date,
          hora: appointment.startTime,
          horaFin: appointment.endTime,
          estado:
            appointment.status === "scheduled"
              ? "agendada"
              : appointment.status === "completed"
                ? "completada"
                : "cancelada",
          especialidad: appointment.type === "class" ? "teacher" : "teacher", // Default
          titulo: appointment.title || "Sesión",
          notas: appointment.notes,
          creadoPor: appointment.createdBy || appointment.professional,
        });

        if (appointment.evaluation) {
          nuevaClase.evaluacion = {
            puntaje: appointment.evaluation.overall || 5,
            comentario: appointment.evaluation.comments || "",
            puntualidad: appointment.evaluation.punctuality || 5,
            calidad: appointment.evaluation.quality || 5,
            fechaEvaluacion: appointment.evaluation.evaluatedAt || new Date(),
          };
        }

        await nuevaClase.save();

        // Agregar al historial del plan del usuario si existe
        const plan = await PlanUsuario.findOne({ userId: appointment.student });
        if (plan) {
          await plan.agregarClaseAlHistorial({
            agendaId: nuevaClase._id,
            fecha: appointment.date,
            estado: nuevaClase.estado,
            profesionalId: appointment.professional,
            especialidad: nuevaClase.especialidad,
          });
        }

        console.log(
          `✅ Cita migrada: ${appointment.title} - ${appointment.date}`,
        );
      }
    }

    console.log("🎉 Migración de citas completada");
  } catch (error) {
    console.error("❌ Error al migrar citas:", error);
  }
}

// Función para ejecutar ambos scripts
export async function runInitializationScripts() {
  await initializeUserPlans();
  await migrateExistingAppointments();
}
