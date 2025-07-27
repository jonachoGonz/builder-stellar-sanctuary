import mongoose, { Schema, Document } from "mongoose";

export interface IBloqueo extends Document {
  // Basic info
  title: string;
  description?: string;
  
  // Timing
  date?: Date; // For specific date blocks
  startDate?: Date; // For date range blocks
  endDate?: Date; // For date range blocks
  startTime?: string; // For time-based blocks (e.g., "09:00")
  endTime?: string; // For time-based blocks (e.g., "17:00")
  allDay?: boolean;
  
  // Recurrence
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: "daily" | "weekly" | "monthly"; // How often it repeats
    interval: number; // Every X days/weeks/months
    daysOfWeek?: string[]; // For weekly pattern: ["monday", "wednesday"]
    dayOfMonth?: number; // For monthly pattern: day 15 of each month
    endDate?: Date; // When recurrence ends
  };
  
  // Scope
  type: "global" | "professional" | "location" | "room";
  professionalId?: mongoose.Types.ObjectId; // If blocking specific professional
  location?: string; // If blocking specific location
  room?: string; // If blocking specific room
  
  // Metadata
  active: boolean;
  reason?: string; // Admin notes on why blocked
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BloqueoSchema = new Schema<IBloqueo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    endTime: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      interval: {
        type: Number,
        min: 1,
        max: 52, // Max every 52 weeks/days/months
      },
      daysOfWeek: [String],
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
      },
      endDate: Date,
    },
    type: {
      type: String,
      enum: ["global", "professional", "location", "room"],
      required: true,
      default: "global",
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    location: String,
    room: String,
    active: {
      type: Boolean,
      default: true,
    },
    reason: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
BloqueoSchema.index({ date: 1, active: 1 });
BloqueoSchema.index({ startDate: 1, endDate: 1, active: 1 });
BloqueoSchema.index({ type: 1, active: 1 });
BloqueoSchema.index({ professionalId: 1, active: 1 });
BloqueoSchema.index({ createdBy: 1 });

// Validation
BloqueoSchema.pre("validate", function (next) {
  // Either date OR startDate/endDate should be provided
  if (!this.date && !this.startDate) {
    return next(new Error("Either date or startDate must be provided"));
  }
  
  // If startDate is provided, endDate should also be provided
  if (this.startDate && !this.endDate) {
    return next(new Error("endDate is required when startDate is provided"));
  }
  
  // Start date should be before end date
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error("startDate must be before endDate"));
  }
  
  // Professional type requires professionalId
  if (this.type === "professional" && !this.professionalId) {
    return next(new Error("professionalId is required for professional blocks"));
  }
  
  // Location type requires location
  if (this.type === "location" && !this.location) {
    return next(new Error("location is required for location blocks"));
  }
  
  // Room type requires room
  if (this.type === "room" && !this.room) {
    return next(new Error("room is required for room blocks"));
  }
  
  // Time validation
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error("startTime must be before endTime"));
  }
  
  next();
});

// Method to check if a datetime is blocked by this bloqueo
BloqueoSchema.methods.isBlocked = function(checkDate: Date, checkTime?: string): boolean {
  if (!this.active) return false;
  
  const checkDateTime = new Date(checkDate);
  checkDateTime.setHours(0, 0, 0, 0); // Reset time for date comparison
  
  // Check date range
  if (this.date) {
    const blockDate = new Date(this.date);
    blockDate.setHours(0, 0, 0, 0);
    if (checkDateTime.getTime() !== blockDate.getTime()) {
      return false;
    }
  } else if (this.startDate && this.endDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    if (checkDateTime < startDate || checkDateTime > endDate) {
      return false;
    }
  }
  
  // If all day block, no need to check time
  if (this.allDay) {
    return true;
  }
  
  // Check time range
  if (this.startTime && this.endTime && checkTime) {
    if (checkTime < this.startTime || checkTime >= this.endTime) {
      return false;
    }
  }
  
  return true;
};

// Static method to find blocks for a specific date/time
BloqueoSchema.statics.findBlocksForDateTime = function(
  date: Date, 
  time?: string, 
  professionalId?: string,
  location?: string,
  room?: string
) {
  const query: any = {
    active: true,
    $or: [
      { type: "global" },
    ]
  };
  
  // Add professional-specific blocks
  if (professionalId) {
    query.$or.push({
      type: "professional",
      professionalId: new mongoose.Types.ObjectId(professionalId)
    });
  }
  
  // Add location-specific blocks
  if (location) {
    query.$or.push({
      type: "location",
      location: location
    });
  }
  
  // Add room-specific blocks
  if (room) {
    query.$or.push({
      type: "room",
      room: room
    });
  }
  
  // Date filtering
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  query.$and = [
    {
      $or: [
        // Single date blocks
        {
          date: {
            $gte: checkDate,
            $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        // Date range blocks
        {
          startDate: { $lte: checkDate },
          endDate: { $gte: checkDate }
        }
      ]
    }
  ];
  
  return this.find(query)
    .populate("professionalId", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .sort({ date: 1, startTime: 1 });
};

export default mongoose.model<IBloqueo>("Bloqueo", BloqueoSchema);
