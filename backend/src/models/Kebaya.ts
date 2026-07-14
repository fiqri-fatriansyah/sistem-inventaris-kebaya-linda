import mongoose, { Schema, Document } from 'mongoose';

export interface IKebaya extends Document {
  jenis: string;
  warna: string;
  price: number;
  totalStock: number;
  availableStock: number;
  laundryStock: number;
  maintenanceStock: number;
  imageUrl?: string;
}

const KebayaSchema: Schema = new Schema({
  jenis: { type: String, required: true },
  warna: { type: String, required: true },
  price: { type: Number, required: true },
  totalStock: { type: Number, required: true },
  availableStock: { type: Number, required: true },
  laundryStock: { type: Number, default: 0 },
  maintenanceStock: { type: Number, default: 0 },
  imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IKebaya>('Kebaya', KebayaSchema);
