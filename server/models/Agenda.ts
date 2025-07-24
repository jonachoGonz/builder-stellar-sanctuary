import mongoose, { Schema, Document } from "mongoose";

export interface IAgenda extends Document {
  alumnoId: mongoose.Types.ObjectId;
  profesionalId: mongoose.Types.ObjectId;
  fecha: Date;
  hora: string;
  horaFin?: string;
  estado: "agendada" | "completada" | "cancelada";
  especialidad: "teacher" | "nutritionist" | "psychologist";
  titulo?: string;
  notas?: string;
  evaluacion?: {
    puntaje: number;
    comentario: string;
    puntualidad: number;
    calidad: number;
    fechaEvaluacion: Date;
  };
  creadoPor: mongoose.Types.ObjectId;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const AgendaSchema = new Schema<IAgenda>(
  {
    alumnoId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profesionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    horaFin: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    estado: {
      type: String,
      enum: ["agendada", "completada", "cancelada"],
      default: "agendada",
    },
    especialidad: {
      type: String,
      enum: ["teacher", "nutritionist", "psychologist"],
      required: true,
    },
    titulo: {
      type: String,
      default: "Sesión",
    },
    notas: {
      type: String,
    },
    evaluacion: {
      puntaje: {
        type: Number,
        min: 1,
        max: 5,
      },
      comentario: String,
      puntualidad: {
        type: Number,
        min: 1,
        max: 5,
      },
      calidad: {
        type: Number,
        min: 1,
        max: 5,
      },
      fechaEvaluacion: Date,
    },
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
AgendaSchema.index({ alumnoId: 1, fecha: 1 });
AgendaSchema.index({ profesionalId: 1, fecha: 1 });
AgendaSchema.index({ fecha: 1, hora: 1 });
AgendaSchema.index({ estado: 1 });

// Middleware to update fechaActualizacion
AgendaSchema.pre("save", function (next) {
  this.fechaActualizacion = new Date();
  next();
});

// Virtual for formatted date
AgendaSchema.virtual("fechaFormateada").get(function () {
  return this.fecha.toLocaleDateString("es-ES");
});

// Virtual for full datetime
AgendaSchema.virtual("fechaHoraCompleta").get(function () {
  const fecha = this.fecha.toLocaleDateString("es-ES");
  return `${fecha} ${this.hora}`;
});

export default mongoose.model<IAgenda>("Agenda", AgendaSchema);
