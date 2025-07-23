import mongoose, { Document, Schema } from "mongoose";

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no-show";
export type AppointmentType =
  | "trial-class"
  | "training"
  | "first-nutrition"
  | "nutrition-followup"
  | "psychology-session"
  | "training-kinesiology"
  | "group-class"
  | "personal-training"
  | "evaluation";

export interface IAppointment extends Document {
  // Basic appointment info
  student: mongoose.Types.ObjectId;
  professional: mongoose.Types.ObjectId;
  type: AppointmentType;
  title: string;
  description?: string;

  // Scheduling
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in minutes

  // Status and tracking
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;

  // Location and resources
  location?: string;
  room?: string;
  equipment?: string[];

  // Plan tracking
  deductFromPlan: boolean; // Whether this appointment counts against student's plan
  planType?: string;

  // Evaluation (filled by student after completion)
  evaluation?: {
    rating: number;
    comments?: string;
    punctuality: number;
    quality: number;
    overall: number;
    evaluatedAt: Date;
  };

  // Metadata
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "trial-class",
        "training",
        "first-nutrition",
        "nutrition-followup",
        "psychology-session",
        "training-kinesiology",
        "group-class",
        "personal-training",
        "evaluation",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: String,
    cancelReason: String,
    location: String,
    room: String,
    equipment: [String],
    deductFromPlan: {
      type: Boolean,
      default: true,
    },
    planType: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
appointmentSchema.index({ student: 1, date: 1 });
appointmentSchema.index({ professional: 1, date: 1 });
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
