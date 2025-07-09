import { Router, Request, Response } from "express";
import Class from "../models/Class";
import User from "../models/User";
import { authenticateToken } from "./auth";

const router = Router();

// Get all classes (with filtering)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { date, instructor, type, status } = req.query;
    const filter: any = {};

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (instructor) filter.instructor = instructor;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const classes = await Class.find(filter)
      .populate("instructor", "firstName lastName email")
      .populate("students", "firstName lastName email")
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Get classes for current user
router.get("/my", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    let classes;

    if (user.role === "teacher") {
      // Get classes where user is the instructor
      classes = await Class.find({ instructor: userId })
        .populate("students", "firstName lastName email")
        .sort({ date: 1, startTime: 1 });
    } else if (user.role === "student") {
      // Get classes where user is a student
      classes = await Class.find({ students: userId })
        .populate("instructor", "firstName lastName email")
        .sort({ date: 1, startTime: 1 });
    } else {
      // Admin gets all classes
      classes = await Class.find()
        .populate("instructor", "firstName lastName email")
        .populate("students", "firstName lastName email")
        .sort({ date: 1, startTime: 1 });
    }

    res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Get my classes error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Create new class (admin/teacher only)
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);

    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear clases",
      });
    }

    const {
      title,
      description,
      type,
      instructor,
      date,
      startTime,
      endTime,
      duration,
      maxCapacity,
      location,
    } = req.body;

    const newClass = new Class({
      title,
      description,
      type,
      instructor: instructor || userId, // Use current user if no instructor specified
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      maxCapacity,
      location,
      status: "scheduled",
    });

    await newClass.save();
    await newClass.populate("instructor", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Clase creada exitosamente",
      class: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Book a class (student only)
router.post(
  "/:classId/book",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { classId } = req.params;

      const user = await User.findById(userId);
      if (!user || user.role !== "student") {
        return res.status(403).json({
          success: false,
          message: "Solo los estudiantes pueden reservar clases",
        });
      }

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Clase no encontrada",
        });
      }

      // Check if already booked
      if (classDoc.students.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Ya tienes reservada esta clase",
        });
      }

      // Check capacity
      if (classDoc.currentCapacity >= classDoc.maxCapacity) {
        // Add to waiting list
        if (!classDoc.waitingList.includes(userId)) {
          classDoc.waitingList.push(userId);
          await classDoc.save();
        }

        return res.status(200).json({
          success: true,
          message: "Agregado a la lista de espera",
          waitingList: true,
        });
      }

      // Add to class
      classDoc.students.push(userId);
      classDoc.currentCapacity += 1;
      await classDoc.save();

      res.json({
        success: true,
        message: "Clase reservada exitosamente",
      });
    } catch (error) {
      console.error("Book class error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Cancel booking (student only)
router.delete(
  "/:classId/book",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { classId } = req.params;

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Clase no encontrada",
        });
      }

      // Remove from students
      const studentIndex = classDoc.students.indexOf(userId);
      if (studentIndex > -1) {
        classDoc.students.splice(studentIndex, 1);
        classDoc.currentCapacity -= 1;

        // Move someone from waiting list if available
        if (classDoc.waitingList.length > 0) {
          const nextStudent = classDoc.waitingList.shift();
          if (nextStudent) {
            classDoc.students.push(nextStudent);
            classDoc.currentCapacity += 1;
          }
        }

        await classDoc.save();

        return res.json({
          success: true,
          message: "Reserva cancelada exitosamente",
        });
      }

      // Remove from waiting list
      const waitingIndex = classDoc.waitingList.indexOf(userId);
      if (waitingIndex > -1) {
        classDoc.waitingList.splice(waitingIndex, 1);
        await classDoc.save();

        return res.json({
          success: true,
          message: "Removido de la lista de espera",
        });
      }

      res.status(400).json({
        success: false,
        message: "No tienes reservada esta clase",
      });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

export default router;
