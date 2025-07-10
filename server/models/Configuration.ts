import mongoose, { Document, Schema } from "mongoose";

// Appointment Type Configuration
export interface IAppointmentTypeConfig extends Document {
  name: string;
  code: string;
  duration: number; // in minutes
  description: string;
  professionalTypes: string[]; // which types of professionals can do this
  color: string; // for calendar display
  isActive: boolean;
  requirements?: string[];
  maxParticipants?: number;
}

const appointmentTypeConfigSchema = new Schema<IAppointmentTypeConfig>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    description: String,
    professionalTypes: [String],
    color: {
      type: String,
      default: "#3B82F6",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requirements: [String],
    maxParticipants: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Center Configuration
export interface ICenterConfiguration extends Document {
  // Operating hours
  operatingHours: {
    start: string;
    end: string;
    days: string[];
  };

  // Time slot configuration
  appointmentSlots: {
    duration: number; // default appointment duration
    buffer: number; // buffer time between appointments
    startTimes: string[]; // available start times
  };

  // Plan configurations
  planConfigurations: {
    basic: {
      totalClasses: number;
      monthlyLimit: number;
      validityMonths: number;
    };
    pro: {
      totalClasses: number;
      monthlyLimit: number;
      validityMonths: number;
    };
    elite: {
      totalClasses: number;
      monthlyLimit: number;
      validityMonths: number;
    };
    personalized: {
      description: string;
    };
  };

  // Cancellation policies
  cancellationPolicy: {
    hoursBeforeClass: number;
    penaltyFree: boolean;
  };

  // Notification settings
  notifications: {
    reminderHours: number[];
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
}

const centerConfigurationSchema = new Schema<ICenterConfiguration>(
  {
    operatingHours: {
      start: {
        type: String,
        default: "06:00",
      },
      end: {
        type: String,
        default: "23:00",
      },
      days: {
        type: [String],
        default: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    },
    appointmentSlots: {
      duration: {
        type: Number,
        default: 60,
      },
      buffer: {
        type: Number,
        default: 15,
      },
      startTimes: {
        type: [String],
        default: [
          "06:00",
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
        ],
      },
    },
    planConfigurations: {
      basic: {
        totalClasses: {
          type: Number,
          default: 8,
        },
        monthlyLimit: {
          type: Number,
          default: 8,
        },
        validityMonths: {
          type: Number,
          default: 1,
        },
      },
      pro: {
        totalClasses: {
          type: Number,
          default: 12,
        },
        monthlyLimit: {
          type: Number,
          default: 12,
        },
        validityMonths: {
          type: Number,
          default: 1,
        },
      },
      elite: {
        totalClasses: {
          type: Number,
          default: 16,
        },
        monthlyLimit: {
          type: Number,
          default: 16,
        },
        validityMonths: {
          type: Number,
          default: 1,
        },
      },
      personalized: {
        description: {
          type: String,
          default: "Plan personalizado según necesidades específicas",
        },
      },
    },
    cancellationPolicy: {
      hoursBeforeClass: {
        type: Number,
        default: 2,
      },
      penaltyFree: {
        type: Boolean,
        default: true,
      },
    },
    notifications: {
      reminderHours: {
        type: [Number],
        default: [24, 2],
      },
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      smsEnabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const AppointmentTypeConfig = mongoose.model<IAppointmentTypeConfig>(
  "AppointmentTypeConfig",
  appointmentTypeConfigSchema,
);

export const CenterConfiguration = mongoose.model<ICenterConfiguration>(
  "CenterConfiguration",
  centerConfigurationSchema,
);
