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

// Get all users with pagination and filtering
router.get("/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string || "";
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
});

// Get user by ID
router.get("/users/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
});

// Create new user
router.post("/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

      const planConfig = planMapping[plan as keyof typeof planMapping] || planMapping.trial;
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
      userData.maxClassesPerDay = role === "nutritionist" || role === "psychologist" ? 10 : 8;
      userData.maxStudentsPerClass = role === "nutritionist" || role === "psychologist" ? 1 : 15;
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
});

// Update user
router.put("/users/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
        const planConfig = planMapping[plan as keyof typeof planMapping] || planMapping.trial;
        
        updateData.plan = plan;
        updateData.totalClasses = planConfig.total;
        updateData.maxMonthlyClasses = planConfig.monthly;
        updateData.usedClasses = 0;
        updateData.remainingClasses = planConfig.total;
        updateData.planStartDate = new Date();
        updateData.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Remove professional fields
        updateData.specialty = undefined;
        updateData.workingHours = undefined;
        updateData.assignedStudents = undefined;
      }
      
      // If changing to professional, add professional fields
      else if (["teacher", "nutritionist", "psychologist"].includes(updateData.role) && user.role === "student") {
        updateData.specialty = updateData.specialty || "";
        updateData.workingHours = updateData.workingHours || {
          start: "09:00",
          end: "18:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        };
        updateData.maxClassesPerDay = updateData.role === "nutritionist" || updateData.role === "psychologist" ? 10 : 8;
        updateData.maxStudentsPerClass = updateData.role === "nutritionist" || updateData.role === "psychologist" ? 1 : 15;
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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

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
});

// Delete user
router.delete("/users/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
});

// Get system statistics
router.get("/stats", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      plan: { $exists: true }
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
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const lastMonthTotal = totalUsers - newUsersThisMonth;
    const growthRate = lastMonthTotal > 0 ? Math.round((newUsersThisMonth / lastMonthTotal) * 100) : 0;

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
});

// Bulk actions
router.post("/users/bulk-action", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
    const filteredUserIds = userIds.filter((id: string) => id !== adminUserId);

    let result;
    switch (action) {
      case "activate":
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } },
          { isActive: true }
        );
        break;
      case "deactivate":
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } },
          { isActive: false }
        );
        break;
      case "delete":
        result = await User.deleteMany(
          { _id: { $in: filteredUserIds } }
        );
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
});

export default router;
