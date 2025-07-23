import { Router, Request, Response } from "express";
import Plan from "../models/Plan";
import User from "../models/User";
import { authenticateToken } from "./auth";
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

// ==================== PUBLIC ENDPOINTS ====================

// GET - Get public plans (for pricing page, etc.)
router.get("/public", async (req: Request, res: Response) => {
  try {
    const plans = await Plan.getPublicPlans();
    
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching public plans:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// GET - Get specific plan by slug (public)
router.get("/public/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const plan = await Plan.findOne({ slug, active: true })
      .select("-discountCodes -createdBy -updatedBy");
    
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

// POST - Apply discount code to plan (public)
router.post("/public/:slug/discount", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Código de descuento requerido",
      });
    }
    
    const plan = await Plan.findOne({ slug, active: true });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
    }
    
    const discountResult = plan.applyDiscountCode(code);
    
    if (!discountResult) {
      return res.status(400).json({
        success: false,
        message: "Código de descuento inválido o expirado",
      });
    }
    
    res.json({
      success: true,
      data: discountResult,
    });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// GET - Get all plans (admin only)
router.get(
  "/admin",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        active,
        search,
        sortBy = "metadata.order",
        sortOrder = "asc",
      } = req.query;

      // Build filter
      let filter: any = {};
      
      if (category) {
        filter.category = category;
      }
      
      if (active !== undefined) {
        filter.active = active === "true";
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const [plans, total] = await Promise.all([
        Plan.find(filter)
          .populate("createdBy", "firstName lastName")
          .populate("updatedBy", "firstName lastName")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit as string)),
        Plan.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: {
          plans,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages: Math.ceil(total / parseInt(limit as string)),
            total,
            limit: parseInt(limit as string),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching admin plans:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// GET - Get specific plan (admin only)
router.get(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findById(id)
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");
      
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
  },
);

// POST - Create new plan (admin only)
router.post(
  "/admin",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).currentUser;
      const planData = req.body;
      
      // Validate required fields
      const requiredFields = [
        "name",
        "description",
        "price",
        "classesPorSemana",
        "clasesTotales",
        "durationWeeks",
        "category",
      ];
      
      for (const field of requiredFields) {
        if (!planData[field]) {
          return res.status(400).json({
            success: false,
            message: `Campo requerido: ${field}`,
          });
        }
      }
      
      // Check if slug already exists
      if (planData.slug) {
        const existingPlan = await Plan.findOne({ slug: planData.slug });
        if (existingPlan) {
          return res.status(400).json({
            success: false,
            message: "Ya existe un plan con ese identificador (slug)",
          });
        }
      }
      
      // If setting as popular, remove popular flag from other plans in same category
      if (planData.popular) {
        await Plan.updateMany(
          { category: planData.category, popular: true },
          { popular: false }
        );
      }
      
      const newPlan = new Plan({
        ...planData,
        createdBy: currentUser._id,
        updatedBy: currentUser._id,
      });
      
      await newPlan.save();
      
      const populatedPlan = await Plan.findById(newPlan._id)
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");
      
      res.status(201).json({
        success: true,
        message: "Plan creado exitosamente",
        data: populatedPlan,
      });
    } catch (error: any) {
      console.error("Error creating plan:", error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un plan con ese nombre o identificador",
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// PUT - Update plan (admin only)
router.put(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).currentUser;
      const { id } = req.params;
      const updateData = req.body;
      
      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan no encontrado",
        });
      }
      
      // Check if slug already exists (if being updated)
      if (updateData.slug && updateData.slug !== plan.slug) {
        const existingPlan = await Plan.findOne({ 
          slug: updateData.slug,
          _id: { $ne: id }
        });
        if (existingPlan) {
          return res.status(400).json({
            success: false,
            message: "Ya existe un plan con ese identificador (slug)",
          });
        }
      }
      
      // If setting as popular, remove popular flag from other plans in same category
      if (updateData.popular && !plan.popular) {
        await Plan.updateMany(
          { 
            category: updateData.category || plan.category, 
            popular: true,
            _id: { $ne: id }
          },
          { popular: false }
        );
      }
      
      // Update plan
      Object.assign(plan, updateData, {
        updatedBy: currentUser._id,
      });
      
      await plan.save();
      
      const updatedPlan = await Plan.findById(id)
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");
      
      res.json({
        success: true,
        message: "Plan actualizado exitosamente",
        data: updatedPlan,
      });
    } catch (error: any) {
      console.error("Error updating plan:", error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un plan con ese nombre o identificador",
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// DELETE - Delete plan (admin only)
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan no encontrado",
        });
      }
      
      // Check if plan has active users (this would require checking PlanUsuario)
      // For now, we'll just soft delete by setting active to false
      plan.active = false;
      await plan.save();
      
      res.json({
        success: true,
        message: "Plan desactivado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// POST - Seed default plans (admin only)
router.post(
  "/admin/seed",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).currentUser;
      
      await Plan.seedDefaultPlans(currentUser._id);
      
      res.json({
        success: true,
        message: "Planes por defecto creados exitosamente",
      });
    } catch (error) {
      console.error("Error seeding plans:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// POST - Manage discount codes (admin only)
router.post(
  "/admin/:id/discount-codes",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, discountCode } = req.body;
      
      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan no encontrado",
        });
      }
      
      switch (action) {
        case "add":
          if (!discountCode.code || !discountCode.percentage || !discountCode.maxUses) {
            return res.status(400).json({
              success: false,
              message: "Datos del código de descuento incompletos",
            });
          }
          
          // Check if code already exists
          const existingCode = plan.discountCodes.find(
            (dc: any) => dc.code === discountCode.code.toUpperCase()
          );
          
          if (existingCode) {
            return res.status(400).json({
              success: false,
              message: "El código de descuento ya existe",
            });
          }
          
          plan.discountCodes.push({
            ...discountCode,
            code: discountCode.code.toUpperCase(),
            currentUses: 0,
          });
          break;
          
        case "remove":
          plan.discountCodes = plan.discountCodes.filter(
            (dc: any) => dc.code !== discountCode.code.toUpperCase()
          );
          break;
          
        case "toggle":
          const codeToToggle = plan.discountCodes.find(
            (dc: any) => dc.code === discountCode.code.toUpperCase()
          );
          if (codeToToggle) {
            codeToToggle.active = !codeToToggle.active;
          }
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: "Acción no válida",
          });
      }
      
      await plan.save();
      
      res.json({
        success: true,
        message: "Código de descuento actualizado exitosamente",
        data: plan,
      });
    } catch (error) {
      console.error("Error managing discount codes:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

export default router;
