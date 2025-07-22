import { Router, Request, Response } from "express";
import User from "../models/User";
import Appointment from "../models/Appointment";
import { authenticateToken } from "./auth";

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  // Check if user has admin privileges
  User.findById(user.userId)
    .then((foundUser) => {
      if (!foundUser || foundUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Se requieren privilegios de administrador",
        });
      }
      next();
    })
    .catch((error) => {
      console.error("Error checking admin privileges:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    });
};

// Middleware to allow admins and professionals to access appointment data
const requireAdminOrProfessional = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  // Check if user has appropriate privileges
  User.findById(user.userId)
    .then((foundUser) => {
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
          message: "Acceso denegado. Se requieren privilegios de administrador o profesional",
        });
      }

      // Store user data for use in route handlers
      (req as any).currentUser = foundUser;
      next();
    })
    .catch((error) => {
      console.error("Error checking user privileges:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    });
};

// Get all users with pagination and filtering
router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = (req.query.search as string) || "";
      const role = req.query.role as string;
      const isActive = req.query.isActive as string;

      // Build filter query
      const filter: any = {};

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (role && role !== "all") {
        filter.role = role;
      }

      if (isActive !== undefined && isActive !== "all") {
        filter.isActive = isActive === "true";
      }

      const skip = (page - 1) * limit;

      // Get users with pagination
      const [users, totalUsers] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Get user by ID
router.get(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Create new user
router.post(
  "/users",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate,
        role,
        plan,
        specialty,
        workingHours,
        isActive,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con este email",
        });
      }

      // Validate required fields
      if (!email || !firstName || !lastName || !role) {
        return res.status(400).json({
          success: false,
          message: "Email, nombre, apellido y rol son requeridos",
        });
      }

      // Create user data
      const userData: any = {
        email,
        firstName,
        lastName,
        phone: phone || "Por completar",
        birthDate: birthDate ? new Date(birthDate) : new Date("1990-01-01"),
        role,
        isActive: isActive !== undefined ? isActive : true,
      };

      // Add password if provided (for non-Google users)
      if (password) {
        userData.password = password;
      }

      // Role-specific fields
      if (role === "student") {
        userData.plan = plan || "trial";

        // Set plan details based on plan type
        const planMapping = {
          trial: { total: 1, monthly: 1 },
          basic: { total: 8, monthly: 8 },
          pro: { total: 12, monthly: 12 },
          elite: { total: 16, monthly: 16 },
          champion: { total: 20, monthly: 20 },
        };

        const planConfig =
          planMapping[plan as keyof typeof planMapping] || planMapping.trial;
        userData.totalClasses = planConfig.total;
        userData.maxMonthlyClasses = planConfig.monthly;
        userData.usedClasses = 0;
        userData.remainingClasses = planConfig.total;
        userData.planStartDate = new Date();
        userData.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (["teacher", "nutritionist", "psychologist"].includes(role)) {
        userData.specialty = specialty || "";
        userData.workingHours = workingHours || {
          start: "09:00",
          end: "18:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        };
        userData.maxClassesPerDay =
          role === "nutritionist" || role === "psychologist" ? 10 : 8;
        userData.maxStudentsPerClass =
          role === "nutritionist" || role === "psychologist" ? 1 : 15;
        userData.assignedStudents = [];
      }

      // Create new user
      const newUser = new User(userData);
      await newUser.save();

      // Return user without password
      const userResponse = await User.findById(newUser._id).select("-password");

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: userResponse,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Update user
router.put(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const updateData = { ...req.body };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.googleId;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Handle role changes
      if (updateData.role) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
          });
        }

        // If changing to student, add plan fields
        if (updateData.role === "student" && user.role !== "student") {
          const planMapping = {
            trial: { total: 1, monthly: 1 },
            basic: { total: 8, monthly: 8 },
            pro: { total: 12, monthly: 12 },
            elite: { total: 16, monthly: 16 },
            champion: { total: 20, monthly: 20 },
          };

          const plan = updateData.plan || "trial";
          const planConfig =
            planMapping[plan as keyof typeof planMapping] || planMapping.trial;

          updateData.plan = plan;
          updateData.totalClasses = planConfig.total;
          updateData.maxMonthlyClasses = planConfig.monthly;
          updateData.usedClasses = 0;
          updateData.remainingClasses = planConfig.total;
          updateData.planStartDate = new Date();
          updateData.planEndDate = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          );

          // Remove professional fields
          updateData.specialty = undefined;
          updateData.workingHours = undefined;
          updateData.assignedStudents = undefined;
        }

        // If changing to professional, add professional fields
        else if (
          ["teacher", "nutritionist", "psychologist"].includes(
            updateData.role,
          ) &&
          user.role === "student"
        ) {
          updateData.specialty = updateData.specialty || "";
          updateData.workingHours = updateData.workingHours || {
            start: "09:00",
            end: "18:00",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          };
          updateData.maxClassesPerDay =
            updateData.role === "nutritionist" ||
            updateData.role === "psychologist"
              ? 10
              : 8;
          updateData.maxStudentsPerClass =
            updateData.role === "nutritionist" ||
            updateData.role === "psychologist"
              ? 1
              : 15;
          updateData.assignedStudents = [];

          // Remove plan fields
          updateData.plan = undefined;
          updateData.totalClasses = undefined;
          updateData.usedClasses = undefined;
          updateData.remainingClasses = undefined;
          updateData.maxMonthlyClasses = undefined;
          updateData.planStartDate = undefined;
          updateData.planEndDate = undefined;
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Delete user
router.delete(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const adminUserId = (req as any).user.userId;

      // Prevent admin from deleting themselves
      if (userId === adminUserId) {
        return res.status(400).json({
          success: false,
          message: "No puedes eliminar tu propia cuenta",
        });
      }

      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Get system statistics
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        activeUsers,
        studentUsers,
        teacherUsers,
        nutritionistUsers,
        psychologistUsers,
        adminUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "nutritionist" }),
        User.countDocuments({ role: "psychologist" }),
        User.countDocuments({ role: "admin" }),
      ]);

      // Calculate monthly revenue based on active students
      const activeStudents = await User.find({
        role: "student",
        isActive: true,
        plan: { $exists: true },
      }).select("plan");

      const planPrices = {
        trial: 0,
        basic: 172800,
        pro: 208500,
        elite: 268000,
        champion: 350000,
      };

      const monthlyRevenue = activeStudents.reduce((total, student) => {
        const price = planPrices[student.plan as keyof typeof planPrices] || 0;
        return total + price;
      }, 0);

      // Calculate growth rate (new users this month)
      const thisMonth = new Date();
      const startOfMonth = new Date(
        thisMonth.getFullYear(),
        thisMonth.getMonth(),
        1,
      );
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      const lastMonthTotal = totalUsers - newUsersThisMonth;
      const growthRate =
        lastMonthTotal > 0
          ? Math.round((newUsersThisMonth / lastMonthTotal) * 100)
          : 0;

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          usersByRole: {
            students: studentUsers,
            teachers: teacherUsers,
            nutritionists: nutritionistUsers,
            psychologists: psychologistUsers,
            admins: adminUsers,
          },
          professionals: teacherUsers + nutritionistUsers + psychologistUsers,
          monthlyRevenue,
          growthRate,
          newUsersThisMonth,
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Bulk actions
router.post(
  "/users/bulk-action",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { action, userIds } = req.body;

      if (!action || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          message: "Acción y lista de usuarios son requeridos",
        });
      }

      const adminUserId = (req as any).user.userId;

      // Prevent admin from affecting themselves in bulk actions
      const filteredUserIds = userIds.filter(
        (id: string) => id !== adminUserId,
      );

      let result;
      switch (action) {
        case "activate":
          result = await User.updateMany(
            { _id: { $in: filteredUserIds } },
            { isActive: true },
          );
          break;
        case "deactivate":
          result = await User.updateMany(
            { _id: { $in: filteredUserIds } },
            { isActive: false },
          );
          break;
        case "delete":
          result = await User.deleteMany({ _id: { $in: filteredUserIds } });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Acción no válida",
          });
      }

      res.json({
        success: true,
        message: `Acción '${action}' ejecutada exitosamente`,
        affectedUsers: result.modifiedCount || result.deletedCount || 0,
      });
    } catch (error) {
      console.error("Error executing bulk action:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// ==================== APPOINTMENT MANAGEMENT ====================

// Get all appointments with filtering and pagination
router.get(
  "/appointments",
  authenticateToken,
  requireAdminOrProfessional,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const studentId = req.query.studentId as string;
      const professionalId = req.query.professionalId as string;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      // Build filter query
      const filter: any = {};
      const currentUser = (req as any).currentUser;

      // If user is not admin, restrict to their own appointments only
      if (currentUser.role !== "admin") {
        filter.professional = currentUser._id;
      } else {
        // Admin can filter by any professional
        if (professionalId) {
          filter.professional = professionalId;
        }
      }

      if (studentId) {
        filter.student = studentId;
      }

      if (type && type !== "all") {
        filter.type = type;
      }

      if (status && status !== "all") {
        filter.status = status;
      }

      if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) {
          filter.date.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          filter.date.$lte = new Date(dateTo);
        }
      }

      const skip = (page - 1) * limit;

      // Get appointments with populated fields
      const [appointments, totalAppointments] = await Promise.all([
        Appointment.find(filter)
          .populate("student", "firstName lastName email plan")
          .populate("professional", "firstName lastName email role specialty")
          .populate("createdBy", "firstName lastName email")
          .sort({ date: -1, startTime: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Appointment.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalAppointments / limit);

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            currentPage: page,
            totalPages,
            totalAppointments,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Create new appointment
router.post(
  "/appointments",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        studentId,
        professionalId,
        type,
        title,
        description,
        date,
        startTime,
        endTime,
        duration,
        location,
        room,
        equipment,
        deductFromPlan,
      } = req.body;

      const adminUserId = (req as any).user.userId;

      // Validate required fields
      if (
        !studentId ||
        !professionalId ||
        !type ||
        !title ||
        !date ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos requeridos deben ser proporcionados",
        });
      }

      // Verify student and professional exist
      const [student, professional] = await Promise.all([
        User.findById(studentId),
        User.findById(professionalId),
      ]);

      if (!student || student.role !== "student") {
        return res.status(400).json({
          success: false,
          message: "Estudiante no válido",
        });
      }

      if (
        !professional ||
        !["teacher", "nutritionist", "psychologist"].includes(professional.role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Profesional no válido",
        });
      }

      // Check for scheduling conflicts
      const appointmentDate = new Date(date);
      const conflicts = await Appointment.find({
        professional: professionalId,
        date: appointmentDate,
        status: { $in: ["scheduled"] },
        $or: [
          {
            startTime: { $lte: startTime },
            endTime: { $gt: startTime },
          },
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime },
          },
          {
            startTime: { $gte: startTime },
            endTime: { $lte: endTime },
          },
        ],
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El profesional ya tiene una cita programada en ese horario",
        });
      }

      // Create appointment
      const appointment = new Appointment({
        student: studentId,
        professional: professionalId,
        type,
        title,
        description,
        date: appointmentDate,
        startTime,
        endTime,
        duration: duration || 60,
        location,
        room,
        equipment: equipment || [],
        deductFromPlan: deductFromPlan !== undefined ? deductFromPlan : true,
        planType: student.plan,
        createdBy: adminUserId,
      });

      await appointment.save();

      // Populate the created appointment
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("student", "firstName lastName email plan")
        .populate("professional", "firstName lastName email role specialty")
        .populate("createdBy", "firstName lastName email");

      // Update student's class count if it deducts from plan
      if (
        deductFromPlan &&
        student.remainingClasses &&
        student.remainingClasses > 0
      ) {
        await User.findByIdAndUpdate(studentId, {
          $inc: {
            usedClasses: 1,
            remainingClasses: -1,
          },
        });
      }

      res.status(201).json({
        success: true,
        message: "Cita creada exitosamente",
        data: populatedAppointment,
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Update appointment
router.put(
  "/appointments/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const appointmentId = req.params.id;
      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.createdBy;

      const existingAppointment = await Appointment.findById(appointmentId);
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }

      // Check for scheduling conflicts if time/date changed
      if (
        updateData.date ||
        updateData.startTime ||
        updateData.endTime ||
        updateData.professional
      ) {
        const checkDate = updateData.date
          ? new Date(updateData.date)
          : existingAppointment.date;
        const checkStartTime =
          updateData.startTime || existingAppointment.startTime;
        const checkEndTime = updateData.endTime || existingAppointment.endTime;
        const checkProfessional =
          updateData.professional || existingAppointment.professional;

        const conflicts = await Appointment.find({
          _id: { $ne: appointmentId },
          professional: checkProfessional,
          date: checkDate,
          status: { $in: ["scheduled"] },
          $or: [
            {
              startTime: { $lte: checkStartTime },
              endTime: { $gt: checkStartTime },
            },
            {
              startTime: { $lt: checkEndTime },
              endTime: { $gte: checkEndTime },
            },
            {
              startTime: { $gte: checkStartTime },
              endTime: { $lte: checkEndTime },
            },
          ],
        });

        if (conflicts.length > 0) {
          return res.status(400).json({
            success: false,
            message:
              "El profesional ya tiene una cita programada en ese horario",
          });
        }
      }

      // Handle plan deduction changes
      if (
        updateData.deductFromPlan !== undefined &&
        updateData.deductFromPlan !== existingAppointment.deductFromPlan
      ) {
        const student = await User.findById(existingAppointment.student);
        if (student) {
          if (
            updateData.deductFromPlan &&
            !existingAppointment.deductFromPlan
          ) {
            // Now deducting from plan
            await User.findByIdAndUpdate(student._id, {
              $inc: {
                usedClasses: 1,
                remainingClasses: -1,
              },
            });
          } else if (
            !updateData.deductFromPlan &&
            existingAppointment.deductFromPlan
          ) {
            // No longer deducting from plan
            await User.findByIdAndUpdate(student._id, {
              $inc: {
                usedClasses: -1,
                remainingClasses: 1,
              },
            });
          }
        }
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true },
      )
        .populate("student", "firstName lastName email plan")
        .populate("professional", "firstName lastName email role specialty")
        .populate("createdBy", "firstName lastName email");

      res.json({
        success: true,
        message: "Cita actualizada exitosamente",
        data: updatedAppointment,
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Delete appointment
router.delete(
  "/appointments/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const appointmentId = req.params.id;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }

      // Restore class count if it was deducted from plan
      if (appointment.deductFromPlan) {
        await User.findByIdAndUpdate(appointment.student, {
          $inc: {
            usedClasses: -1,
            remainingClasses: 1,
          },
        });
      }

      await Appointment.findByIdAndDelete(appointmentId);

      res.json({
        success: true,
        message: "Cita eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Get appointment statistics
router.get(
  "/appointments/stats",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay()),
      );
      const endOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 6),
      );

      const [
        totalAppointments,
        todayAppointments,
        weekAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
      ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
        Appointment.countDocuments({
          date: { $gte: startOfWeek, $lte: endOfWeek },
        }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "cancelled" }),
        Appointment.countDocuments({ status: "no-show" }),
      ]);

      // Get appointments by type
      const appointmentsByType = await Appointment.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get appointments by professional
      const appointmentsByProfessional = await Appointment.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "professional",
            foreignField: "_id",
            as: "professionalInfo",
          },
        },
        {
          $unwind: "$professionalInfo",
        },
        {
          $group: {
            _id: "$professional",
            count: { $sum: 1 },
            name: {
              $first: {
                $concat: [
                  "$professionalInfo.firstName",
                  " ",
                  "$professionalInfo.lastName",
                ],
              },
            },
            role: { $first: "$professionalInfo.role" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      res.json({
        success: true,
        data: {
          totalAppointments,
          todayAppointments,
          weekAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          appointmentsByType,
          appointmentsByProfessional,
          completionRate:
            totalAppointments > 0
              ? Math.round((completedAppointments / totalAppointments) * 100)
              : 0,
          cancellationRate:
            totalAppointments > 0
              ? Math.round((cancelledAppointments / totalAppointments) * 100)
              : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

export default router;
