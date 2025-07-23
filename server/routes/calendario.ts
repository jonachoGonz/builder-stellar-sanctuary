import { Router, Request, Response } from "express";
import Agenda from "../models/Agenda";
import Bloqueo from "../models/Bloqueo";
import PlanUsuario from "../models/PlanUsuario";
import User from "../models/User";
import { authenticateToken } from "./auth";
import { runInitializationScripts } from "../scripts/initializePlans";
import mongoose from "mongoose";

const router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  const foundUser = await User.findById(user.userId);
  if (!foundUser || foundUser.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren privilegios de administrador",
    });
  }
  (req as any).currentUser = foundUser;
  next();
};

// Middleware to check if user is professional or admin
const requireProfessionalOrAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  const foundUser = await User.findById(user.userId);
  if (!foundUser) {
    return res.status(403).json({
      success: false,
      message: "Usuario no encontrado",
    });
  }

  const allowedRoles = ["admin", "teacher", "nutritionist", "psychologist"];
  if (!allowedRoles.includes(foundUser.role)) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren privilegios de profesional o administrador",
    });
  }

  (req as any).currentUser = foundUser;
  next();
};

// ==================== AGENDA ENDPOINTS ====================

// GET - Obtener agenda según tipo de usuario
router.get("/agenda", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const { 
      fechaInicio, 
      fechaFin, 
      profesionalId, 
      alumnoId, 
      especialidad, 
      estado,
      page = 1,
      limit = 50 
    } = req.query;

    // Build filter based on user role
    let filter: any = {};

    // Date range filter
    if (fechaInicio || fechaFin) {
      filter.fecha = {};
      if (fechaInicio) filter.fecha.$gte = new Date(fechaInicio as string);
      if (fechaFin) filter.fecha.$lte = new Date(fechaFin as string);
    }

    // Role-based access control
    if (currentUser.role === "admin") {
      // Admins can see everything with optional filters
      if (profesionalId) filter.profesionalId = profesionalId;
      if (alumnoId) filter.alumnoId = alumnoId;
    } else if (["teacher", "nutritionist", "psychologist"].includes(currentUser.role)) {
      // Professionals can only see their own agenda
      filter.profesionalId = currentUser._id;
      if (alumnoId) filter.alumnoId = alumnoId;
    } else if (currentUser.role === "student") {
      // Students can only see their own classes
      filter.alumnoId = currentUser._id;
      if (profesionalId) filter.profesionalId = profesionalId;
    }

    // Additional filters
    if (especialidad) filter.especialidad = especialidad;
    if (estado) filter.estado = estado;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [agenda, total] = await Promise.all([
      Agenda.find(filter)
        .populate("alumnoId", "firstName lastName email plan")
        .populate("profesionalId", "firstName lastName email role specialty")
        .populate("creadoPor", "firstName lastName")
        .sort({ fecha: 1, hora: 1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Agenda.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        agenda,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
          total,
          limit: parseInt(limit as string),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching agenda:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// POST - Crear nueva clase en agenda
router.post("/agenda", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const {
      alumnoId,
      profesionalId,
      fecha,
      hora,
      horaFin,
      especialidad,
      titulo,
      notas,
    } = req.body;

    // Validate required fields
    if (!alumnoId || !profesionalId || !fecha || !hora || !especialidad) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
      });
    }

    // Role-based permissions for creating classes
    let actualProfessionalId = profesionalId;
    if (currentUser.role !== "admin") {
      if (["teacher", "nutritionist", "psychologist"].includes(currentUser.role)) {
        actualProfessionalId = currentUser._id; // Professionals can only create for themselves
      } else if (currentUser.role === "student") {
        // Students can create classes, but need to check their plan
        const plan = await PlanUsuario.findOne({ userId: currentUser._id });
        if (!plan || !plan.puedeAgendarEstaSeemana()) {
          return res.status(400).json({
            success: false,
            message: "No puedes agendar más clases esta semana o tu plan ha expirado",
          });
        }
      }
    }

    // Check for schedule conflicts
    const fechaClase = new Date(fecha);
    const conflictos = await Agenda.find({
      profesionalId: actualProfessionalId,
      fecha: fechaClase,
      hora: hora,
      estado: { $ne: "cancelada" },
    });

    if (conflictos.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una clase agendada en ese horario",
      });
    }

    // Check for blocks
    const bloques = await Bloqueo.find({
      fecha: fechaClase,
      activo: true,
      $or: [
        { tipo: "global" },
        { tipo: "profesional", profesionalId: actualProfessionalId },
      ],
    });

    const bloqueConflicto = bloques.find(bloque => {
      if (bloque.todoElDia) return true;
      if (bloque.hora === hora) return true;
      return false;
    });

    if (bloqueConflicto) {
      return res.status(400).json({
        success: false,
        message: "No se puede agendar en un horario bloqueado",
      });
    }

    // Create the class
    const nuevaClase = new Agenda({
      alumnoId,
      profesionalId: actualProfessionalId,
      fecha: fechaClase,
      hora,
      horaFin: horaFin || null,
      especialidad,
      titulo: titulo || "Sesión",
      notas,
      creadoPor: currentUser._id,
    });

    await nuevaClase.save();

    // Add to student's plan history
    const plan = await PlanUsuario.findOne({ userId: alumnoId });
    if (plan) {
      await plan.agregarClaseAlHistorial({
        agendaId: nuevaClase._id,
        fecha: fechaClase,
        estado: "agendada",
        profesionalId: actualProfessionalId,
        especialidad,
      });
    }

    // Populate the created class
    const claseCompleta = await Agenda.findById(nuevaClase._id)
      .populate("alumnoId", "firstName lastName email")
      .populate("profesionalId", "firstName lastName email role specialty");

    res.status(201).json({
      success: true,
      message: "Clase agendada exitosamente",
      data: claseCompleta,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// PUT - Actualizar clase (cambiar estado, evaluar, etc.)
router.put("/agenda/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);
    const { id } = req.params;
    const updateData = req.body;

    const clase = await Agenda.findById(id);
    if (!clase) {
      return res.status(404).json({
        success: false,
        message: "Clase no encontrada",
      });
    }

    // Permission checks
    const isAdmin = currentUser?.role === "admin";
    const isProfessional = clase.profesionalId.toString() === currentUser?._id.toString();
    const isStudent = clase.alumnoId.toString() === currentUser?._id.toString();

    if (!isAdmin && !isProfessional && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar esta clase",
      });
    }

    // Handle specific updates based on user role
    if (updateData.estado === "completada" && (isAdmin || isProfessional)) {
      clase.estado = "completada";
      
      // Update student's plan
      const plan = await PlanUsuario.findOne({ userId: clase.alumnoId });
      if (plan) {
        await plan.actualizarEstadoClase(clase._id.toString(), "completada");
      }
    }

    if (updateData.evaluacion && isStudent && clase.estado === "completada") {
      clase.evaluacion = {
        ...updateData.evaluacion,
        fechaEvaluacion: new Date(),
      };
    }

    if (updateData.estado === "cancelada") {
      clase.estado = "cancelada";
      
      // Update student's plan
      const plan = await PlanUsuario.findOne({ userId: clase.alumnoId });
      if (plan) {
        await plan.actualizarEstadoClase(clase._id.toString(), "cancelada");
      }
    }

    // Update other fields if permitted
    if (isAdmin || isProfessional) {
      if (updateData.titulo) clase.titulo = updateData.titulo;
      if (updateData.notas) clase.notas = updateData.notas;
      if (updateData.hora) clase.hora = updateData.hora;
      if (updateData.horaFin) clase.horaFin = updateData.horaFin;
    }

    await clase.save();

    const claseActualizada = await Agenda.findById(id)
      .populate("alumnoId", "firstName lastName email")
      .populate("profesionalId", "firstName lastName email role specialty");

    res.json({
      success: true,
      message: "Clase actualizada exitosamente",
      data: claseActualizada,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// DELETE - Eliminar clase (solo admin)
router.delete("/agenda/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const clase = await Agenda.findById(id);
    if (!clase) {
      return res.status(404).json({
        success: false,
        message: "Clase no encontrada",
      });
    }

    // Update student's plan to remove the class
    const plan = await PlanUsuario.findOne({ userId: clase.alumnoId });
    if (plan) {
      plan.historial = plan.historial.filter(
        (h: any) => h.agendaId.toString() !== id
      );
      if (clase.estado === "completada") {
        plan.clasesUsadas = Math.max(0, plan.clasesUsadas - 1);
      }
      await plan.save();
    }

    await Agenda.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Clase eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// ==================== BLOQUEO ENDPOINTS ====================

// GET - Obtener bloqueos
router.get("/bloqueos", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);
    const { fechaInicio, fechaFin, profesionalId } = req.query;

    let filter: any = { activo: true };

    // Date range
    if (fechaInicio || fechaFin) {
      filter.fecha = {};
      if (fechaInicio) filter.fecha.$gte = new Date(fechaInicio as string);
      if (fechaFin) filter.fecha.$lte = new Date(fechaFin as string);
    }

    // Role-based access
    if (currentUser?.role === "admin") {
      if (profesionalId) filter.profesionalId = profesionalId;
    } else if (["teacher", "nutritionist", "psychologist"].includes(currentUser?.role || "")) {
      filter.$or = [
        { tipo: "global" },
        { tipo: "profesional", profesionalId: currentUser?._id },
      ];
    } else {
      // Students can see all blocks that affect them
      filter.$or = [
        { tipo: "global" },
        { tipo: "profesional" },
      ];
    }

    const bloqueos = await Bloqueo.find(filter)
      .populate("profesionalId", "firstName lastName role specialty")
      .populate("creadoPor", "firstName lastName")
      .sort({ fecha: 1, hora: 1 });

    res.json({
      success: true,
      data: bloqueos,
    });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// POST - Crear bloqueo
router.post("/bloqueos", authenticateToken, requireProfessionalOrAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).currentUser;
    const {
      tipo,
      profesionalId,
      fecha,
      hora,
      horaFin,
      todoElDia,
      motivo,
      fechaExpiracion,
    } = req.body;

    // Validate permissions
    if (tipo === "global" && currentUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo administradores pueden crear bloqueos globales",
      });
    }

    const nuevoBloqueo = new Bloqueo({
      tipo: tipo || "profesional",
      profesionalId: tipo === "global" ? undefined : (profesionalId || currentUser._id),
      fecha: new Date(fecha),
      hora: todoElDia ? undefined : hora,
      horaFin: todoElDia ? undefined : horaFin,
      todoElDia: todoElDia || false,
      motivo: motivo || "Horario no disponible",
      fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : undefined,
      creadoPor: currentUser._id,
    });

    await nuevoBloqueo.save();

    const bloqueoCompleto = await Bloqueo.findById(nuevoBloqueo._id)
      .populate("profesionalId", "firstName lastName role specialty")
      .populate("creadoPor", "firstName lastName");

    res.status(201).json({
      success: true,
      message: "Bloqueo creado exitosamente",
      data: bloqueoCompleto,
    });
  } catch (error) {
    console.error("Error creating block:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// DELETE - Eliminar bloqueo
router.delete("/bloqueos/:id", authenticateToken, requireProfessionalOrAdmin, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).currentUser;
    const { id } = req.params;

    const bloqueo = await Bloqueo.findById(id);
    if (!bloqueo) {
      return res.status(404).json({
        success: false,
        message: "Bloqueo no encontrado",
      });
    }

    // Permission check
    const isAdmin = currentUser.role === "admin";
    const isOwner = bloqueo.profesionalId?.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar este bloqueo",
      });
    }

    await Bloqueo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Bloqueo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting block:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// ==================== PLAN USUARIO ENDPOINTS ====================

// GET - Obtener plan de usuario
router.get("/plan/:userId?", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);
    const { userId } = req.params;

    let targetUserId = userId;

    // Students can only see their own plan, others can see any plan
    if (currentUser?.role === "student" && (!userId || userId !== currentUser._id.toString())) {
      targetUserId = currentUser._id.toString();
    }

    if (!targetUserId) {
      targetUserId = currentUser?._id.toString();
    }

    const plan = await PlanUsuario.findOne({ userId: targetUserId })
      .populate("userId", "firstName lastName email")
      .populate("historial.profesionalId", "firstName lastName role specialty")
      .populate("historial.agendaId");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Automatic class completion job (should be run periodically)
router.post("/completar-automatico", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ahora = new Date();
    const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);

    // Find classes that should be automatically completed
    const clasesParaCompletar = await Agenda.find({
      estado: "agendada",
      fecha: { $lte: hace2Horas },
    });

    let completadas = 0;

    for (const clase of clasesParaCompletar) {
      clase.estado = "completada";
      await clase.save();

      // Update student's plan
      const plan = await PlanUsuario.findOne({ userId: clase.alumnoId });
      if (plan) {
        await plan.actualizarEstadoClase(clase._id.toString(), "completada");
      }

      completadas++;
    }

    res.json({
      success: true,
      message: `Se completaron automáticamente ${completadas} clases`,
      data: { completadas },
    });
  } catch (error) {
    console.error("Error auto-completing classes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Initialize system (run once to set up existing data)
router.post("/inicializar-sistema", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await runInitializationScripts();

    res.json({
      success: true,
      message: "Sistema inicializado correctamente",
    });
  } catch (error) {
    console.error("Error initializing system:", error);
    res.status(500).json({
      success: false,
      message: "Error al inicializar el sistema",
    });
  }
});

// Get calendar statistics for dashboard
router.get("/estadisticas", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const currentUser = await User.findById(user.userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    let filter: any = {};

    // Filter based on user role
    if (currentUser.role === "admin") {
      // Admins see all statistics
    } else if (["teacher", "nutritionist", "psychologist"].includes(currentUser.role)) {
      filter.profesionalId = currentUser._id;
    } else if (currentUser.role === "student") {
      filter.alumnoId = currentUser._id;
    }

    const [clasesHoy, clasesSemana, clasesTotal, clasesCompletadas] = await Promise.all([
      Agenda.countDocuments({
        ...filter,
        fecha: {
          $gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
          $lt: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1),
        },
        estado: { $ne: "cancelada" },
      }),
      Agenda.countDocuments({
        ...filter,
        fecha: { $gte: inicioSemana, $lte: finSemana },
        estado: { $ne: "cancelada" },
      }),
      Agenda.countDocuments({
        ...filter,
        estado: { $ne: "cancelada" },
      }),
      Agenda.countDocuments({
        ...filter,
        estado: "completada",
      }),
    ]);

    // Get user plan if student
    let planData = null;
    if (currentUser.role === "student") {
      planData = await PlanUsuario.findOne({ userId: currentUser._id });
    }

    res.json({
      success: true,
      data: {
        clasesHoy,
        clasesSemana,
        clasesTotal,
        clasesCompletadas,
        planUsuario: planData,
        tasaCompletacion: clasesTotal > 0 ? Math.round((clasesCompletadas / clasesTotal) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

export default router;
