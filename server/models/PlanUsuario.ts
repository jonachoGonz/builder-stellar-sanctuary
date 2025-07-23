import mongoose, { Schema, Document } from "mongoose";

export interface IHistorialClase {
  agendaId: mongoose.Types.ObjectId;
  fecha: Date;
  estado: "agendada" | "completada" | "cancelada";
  profesionalId: mongoose.Types.ObjectId;
  especialidad: string;
}

export interface IPlanUsuario extends Document {
  userId: mongoose.Types.ObjectId;
  tipoPlan: "trial" | "basic" | "pro" | "elite" | "champion";
  clasesPorSemana: number;
  clasesTotales: number;
  clasesUsadas: number;
  clasesRestantes: number;
  fechaInicio: Date;
  fechaVencimiento: Date;
  activo: boolean;
  historial: IHistorialClase[];
  ultimaActualizacion: Date;
}

const HistorialClaseSchema = new Schema<IHistorialClase>({
  agendaId: {
    type: Schema.Types.ObjectId,
    ref: "Agenda",
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ["agendada", "completada", "cancelada"],
    required: true,
  },
  profesionalId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  especialidad: {
    type: String,
    required: true,
  },
});

const PlanUsuarioSchema = new Schema<IPlanUsuario>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    tipoPlan: {
      type: String,
      enum: ["trial", "basic", "pro", "elite", "champion"],
      required: true,
      default: "trial",
    },
    clasesPorSemana: {
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
    clasesUsadas: {
      type: Number,
      default: 0,
      min: 0,
    },
    clasesRestantes: {
      type: Number,
      required: true,
      min: 0,
    },
    fechaInicio: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fechaVencimiento: {
      type: Date,
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    historial: [HistorialClaseSchema],
    ultimaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
PlanUsuarioSchema.index({ userId: 1 });
PlanUsuarioSchema.index({ tipoPlan: 1 });
PlanUsuarioSchema.index({ fechaVencimiento: 1 });

// Pre-save middleware to update clasesRestantes
PlanUsuarioSchema.pre("save", function (next) {
  this.clasesRestantes = Math.max(0, this.clasesTotales - this.clasesUsadas);
  this.ultimaActualizacion = new Date();
  next();
});

// Method to check if plan is active and not expired
PlanUsuarioSchema.methods.estaVigente = function () {
  return this.activo && new Date() <= this.fechaVencimiento;
};

// Method to check weekly class limit
PlanUsuarioSchema.methods.puedeAgendarEstaSeemana = function () {
  if (!this.estaVigente()) return false;

  // Get start of current week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(
    now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1),
  );
  startOfWeek.setHours(0, 0, 0, 0);

  // Count classes this week
  const clasesEstaSeana = this.historial.filter((clase: IHistorialClase) => {
    return (
      clase.fecha >= startOfWeek &&
      clase.estado !== "cancelada" &&
      clase.fecha <= now
    );
  }).length;

  return clasesEstaSeana < this.clasesPorSemana && this.clasesRestantes > 0;
};

// Method to add class to history
PlanUsuarioSchema.methods.agregarClaseAlHistorial = function (
  claseData: Partial<IHistorialClase>,
) {
  this.historial.push(claseData);

  if (claseData.estado === "completada") {
    this.clasesUsadas += 1;
  }

  return this.save();
};

// Method to update class status in history
PlanUsuarioSchema.methods.actualizarEstadoClase = function (
  agendaId: string,
  nuevoEstado: string,
) {
  const clase = this.historial.find(
    (h: IHistorialClase) => h.agendaId.toString() === agendaId,
  );

  if (clase) {
    const estadoAnterior = clase.estado;
    clase.estado = nuevoEstado;

    // Adjust used classes count
    if (estadoAnterior === "completada" && nuevoEstado !== "completada") {
      this.clasesUsadas = Math.max(0, this.clasesUsadas - 1);
    } else if (
      estadoAnterior !== "completada" &&
      nuevoEstado === "completada"
    ) {
      this.clasesUsadas += 1;
    }
  }

  return this.save();
};

// Static method to initialize plan for new user
PlanUsuarioSchema.statics.inicializarPlan = function (
  userId: mongoose.Types.ObjectId,
  tipoPlan: string = "trial",
) {
  const planConfig = {
    trial: { clases: 1, semanas: 1 },
    basic: { clases: 8, semanas: 4 },
    pro: { clases: 12, semanas: 4 },
    elite: { clases: 16, semanas: 4 },
    champion: { clases: 20, semanas: 4 },
  };

  const config =
    planConfig[tipoPlan as keyof typeof planConfig] || planConfig.trial;
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + config.semanas * 7);

  return this.create({
    userId,
    tipoPlan,
    clasesPorSemana: Math.ceil(config.clases / config.semanas),
    clasesTotales: config.clases,
    clasesUsadas: 0,
    clasesRestantes: config.clases,
    fechaVencimiento,
  });
};

export default mongoose.model<IPlanUsuario>("PlanUsuario", PlanUsuarioSchema);
