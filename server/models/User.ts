import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole =
  | "admin"
  | "teacher"
  | "student"
  | "nutritionist"
  | "psychologist";
export type ActivityLevel = "sedentary" | "active" | "very-active";
export type PlanType = "basic" | "pro" | "elite" | "personalized";

export interface IUser extends Document {
  // Basic info
  email: string;
  password?: string; // Optional for Google OAuth users
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: Date;
  role: UserRole;

  // Optional personal info
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  occupation?: string;
  activityLevel?: ActivityLevel;
  medicalConditions?: string;
  injuries?: string;

  // Emergency contact
  emergencyContact?: {
    name: string;
    phone: string;
  };

  // Gym-specific
  plan?: PlanType;
  memberSince: Date;
  isActive: boolean;

  // Plan management (for students)
  planDuration?: number; // in months
  totalClasses?: number;
  usedClasses?: number;
  remainingClasses?: number;
  maxMonthlyClasses?: number;
  planStartDate?: Date;
  planEndDate?: Date;

  // Professional management
  assignedStudents?: mongoose.Types.ObjectId[];
  workingHours?: {
    start: string;
    end: string;
    days: string[]; // ['monday', 'tuesday', etc.]
  };
  blockedDates?: Date[];
  specialty?: string;

  // Google OAuth
  googleId?: string;
  avatar?: string;

  // Admin/Teacher specific
  permissions?: string[];
  maxClassesPerDay?: number;
  maxStudentsPerClass?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: function(this: IUser) {
        // Phone is required unless user was created via Google OAuth
        return !this.googleId;
      },
    },
    birthDate: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "nutritionist", "psychologist"],
      default: "student",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    occupation: String,
    activityLevel: {
      type: String,
      enum: ["sedentary", "active", "very-active"],
    },
    medicalConditions: String,
    injuries: String,
    emergencyContact: {
      name: String,
      phone: String,
    },
    plan: {
      type: String,
      enum: ["basic", "pro", "elite", "personalized"],
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: String,
    avatar: String,
    permissions: [String],
    maxClassesPerDay: {
      type: Number,
      default: 8,
    },
    maxStudentsPerClass: {
      type: Number,
      default: 15,
    },
    // Plan management fields
    planDuration: Number,
    totalClasses: Number,
    usedClasses: {
      type: Number,
      default: 0,
    },
    remainingClasses: {
      type: Number,
      default: 0,
    },
    maxMonthlyClasses: Number,
    planStartDate: Date,
    planEndDate: Date,
    // Professional management
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    workingHours: {
      start: String,
      end: String,
      days: [String],
    },
    blockedDates: [Date],
    specialty: String,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name method
userSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

export default mongoose.model<IUser>("User", userSchema);
