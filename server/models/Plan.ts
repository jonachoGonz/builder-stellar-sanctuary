import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  classesPorSemana: number;
  clasesTotales: number;
  durationWeeks: number;
  benefits: string[];
  popular: boolean;
  active: boolean;
  category: "trial" | "basic" | "premium" | "elite" | "custom";
  discountCodes: {
    code: string;
    percentage: number;
    maxUses: number;
    currentUses: number;
    expiryDate?: Date;
    active: boolean;
  }[];
  metadata: {
    color: string;
    icon?: string;
    order: number;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "CLP",
      uppercase: true,
    },
    classesPorSemana: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    clasesTotales: {
      type: Number,
      required: true,
      min: 1,
    },
    durationWeeks: {
      type: Number,
      required: true,
      min: 1,
      max: 52,
    },
    benefits: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],
    popular: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["trial", "basic", "premium", "elite", "custom"],
      required: true,
      default: "basic",
    },
    discountCodes: [
      {
        code: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
          maxlength: 20,
        },
        percentage: {
          type: Number,
          required: true,
          min: 1,
          max: 100,
        },
        maxUses: {
          type: Number,
          required: true,
          min: 1,
        },
        currentUses: {
          type: Number,
          default: 0,
          min: 0,
        },
        expiryDate: Date,
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
    metadata: {
      color: {
        type: String,
        default: "#3B82F6",
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
      icon: String,
      order: {
        type: Number,
        default: 0,
      },
    },
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
  },
);

// Indexes
PlanSchema.index({ slug: 1 }, { unique: true });
PlanSchema.index({ active: 1 });
PlanSchema.index({ popular: 1 });
PlanSchema.index({ category: 1 });
PlanSchema.index({ "metadata.order": 1 });

// Pre-save middleware
PlanSchema.pre("save", function (next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Validate that only one plan can be popular per category
  if (this.popular && this.isModified("popular")) {
    // This will be handled in the route with additional validation
  }

  next();
});

// Virtual for display price
PlanSchema.virtual("displayPrice").get(function () {
  return `${this.currency} $${this.price.toLocaleString()}`;
});

// Virtual for weekly price
PlanSchema.virtual("weeklyPrice").get(function () {
  if (this.durationWeeks > 0) {
    return Math.round(this.price / this.durationWeeks);
  }
  return this.price;
});

// Method to check if plan has active discount codes
PlanSchema.methods.hasActiveDiscounts = function () {
  return this.discountCodes.some(
    (code: any) =>
      code.active &&
      code.currentUses < code.maxUses &&
      (!code.expiryDate || code.expiryDate > new Date()),
  );
};

// Method to apply discount code
PlanSchema.methods.applyDiscountCode = function (code: string) {
  const discountCode = this.discountCodes.find(
    (dc: any) =>
      dc.code === code.toUpperCase() &&
      dc.active &&
      dc.currentUses < dc.maxUses &&
      (!dc.expiryDate || dc.expiryDate > new Date()),
  );

  if (discountCode) {
    const discountAmount = Math.round((this.price * discountCode.percentage) / 100);
    const finalPrice = this.price - discountAmount;
    
    return {
      originalPrice: this.price,
      discountPercentage: discountCode.percentage,
      discountAmount,
      finalPrice,
      discountCode: discountCode.code,
    };
  }

  return null;
};

// Static method to get plans for public display
PlanSchema.statics.getPublicPlans = function () {
  return this.find({ active: true })
    .select("-discountCodes -createdBy -updatedBy")
    .sort({ "metadata.order": 1, price: 1 });
};

// Static method to seed default plans
PlanSchema.statics.seedDefaultPlans = async function (adminUserId: mongoose.Types.ObjectId) {
  const existingPlans = await this.countDocuments();
  if (existingPlans > 0) {
    return; // Plans already exist
  }

  const defaultPlans = [
    {
      name: "Plan Trial",
      description: "Prueba nuestros servicios con una clase gratuita",
      price: 0,
      classesPorSemana: 1,
      clasesTotales: 1,
      durationWeeks: 1,
      benefits: ["1 clase gratuita", "Evaluación inicial", "Plan personalizado"],
      category: "trial",
      metadata: { color: "#10B981", order: 1 },
      createdBy: adminUserId,
    },
    {
      name: "Plan Básico",
      description: "Ideal para comenzar tu transformación",
      price: 172800,
      classesPorSemana: 2,
      clasesTotales: 8,
      durationWeeks: 4,
      benefits: [
        "2 sesiones por semana",
        "Seguimiento personalizado",
        "Plan nutricional básico",
        "Evaluación inicial gratuita",
      ],
      category: "basic",
      metadata: { color: "#3B82F6", order: 2 },
      createdBy: adminUserId,
    },
    {
      name: "Plan Pro",
      description: "El equilibrio perfecto",
      price: 208500,
      classesPorSemana: 3,
      clasesTotales: 12,
      durationWeeks: 4,
      benefits: [
        "3 sesiones por semana",
        "Plan nutricional completo",
        "Evaluaciones mensuales",
        "Acceso a grupo VIP",
      ],
      category: "premium",
      popular: true,
      metadata: { color: "#8B5CF6", order: 3 },
      createdBy: adminUserId,
    },
    {
      name: "Plan Elite",
      description: "Para resultados serios",
      price: 268000,
      classesPorSemana: 4,
      clasesTotales: 16,
      durationWeeks: 4,
      benefits: [
        "4 sesiones por semana",
        "Profesional personal",
        "Plan nutricional premium",
        "Acceso a todos los servicios",
      ],
      category: "elite",
      metadata: { color: "#F59E0B", order: 4 },
      createdBy: adminUserId,
    },
  ];

  return this.insertMany(defaultPlans);
};

export default mongoose.model<IPlan>("Plan", PlanSchema);
