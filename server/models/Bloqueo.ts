import mongoose, { Schema, Document } from "mongoose";

export interface IBloqueo extends Document {
  tipo: "global" | "profesional";
  profesionalId?: mongoose.Types.ObjectId;
  fecha: Date;
  hora?: string;
  horaFin?: string;
  todoElDia: boolean;
  motivo?: string;
  creadoPor: mongoose.Types.ObjectId;
  fechaCreacion: Date;
  fechaExpiracion?: Date;
  activo: boolean;
}

const BloqueoSchema = new Schema<IBloqueo>(
  {
    tipo: {
      type: String,
      enum: ["global", "profesional"],
      required: true,
    },
    profesionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.tipo === "profesional";
      },
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: function () {
        return !this.todoElDia;
      },
    },
    horaFin: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    todoElDia: {
      type: Boolean,
      default: false,
    },
    motivo: {
      type: String,
      default: "Horario no disponible",
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
    fechaExpiracion: {
      type: Date,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
BloqueoSchema.index({ fecha: 1, activo: 1 });
BloqueoSchema.index({ profesionalId: 1, fecha: 1 });
BloqueoSchema.index({ tipo: 1, fecha: 1 });

// Virtual for formatted date
BloqueoSchema.virtual("fechaFormateada").get(function () {
  return this.fecha.toLocaleDateString("es-ES");
});

// Method to check if block is currently active
BloqueoSchema.methods.estaActivo = function () {
  if (!this.activo) return false;
  if (this.fechaExpiracion && new Date() > this.fechaExpiracion) return false;
  return true;
};

// Static method to find active blocks for a date
BloqueoSchema.statics.bloquesActivosPorFecha = function (fecha: Date) {
  return this.find({
    fecha: {
      $gte: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
      $lt: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1),
    },
    activo: true,
    $or: [
      { fechaExpiracion: { $exists: false } },
      { fechaExpiracion: { $gte: new Date() } },
    ],
  });
};

export default mongoose.model<IBloqueo>("Bloqueo", BloqueoSchema);
