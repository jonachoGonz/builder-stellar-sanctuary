import mongoose, { Document, Schema } from "mongoose";

export type ClassStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";
export type ClassType =
  | "functional"
  | "yoga"
  | "pilates"
  | "strength"
  | "cardio"
  | "crossfit"
  | "personal";

export interface IClass extends Document {
  title: string;
  description?: string;
  type: ClassType;
  instructor: mongoose.Types.ObjectId; // Reference to User with role 'teacher'
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  maxCapacity: number;
  currentCapacity: number;
  location: string;
  status: ClassStatus;
  students: mongoose.Types.ObjectId[]; // References to Users with role 'student'
  waitingList: mongoose.Types.ObjectId[];
  recurring?: {
    isRecurring: boolean;
    frequency: "daily" | "weekly" | "monthly";
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "functional",
        "yoga",
        "pilates",
        "strength",
        "cardio",
        "crossfit",
        "personal",
      ],
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 15,
    },
    currentCapacity: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    waitingList: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      endDate: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
classSchema.index({ date: 1, startTime: 1 });
classSchema.index({ instructor: 1 });
classSchema.index({ students: 1 });
classSchema.index({ status: 1 });

export default mongoose.model<IClass>("Class", classSchema);
