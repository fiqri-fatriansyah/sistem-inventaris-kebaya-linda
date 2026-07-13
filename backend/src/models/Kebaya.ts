import mongoose, { Schema, Document } from 'mongoose';

export interface IKebaya extends Document {
  jenis: string;
  warna: string;
  price: number;
  totalStock: number;
  availableStock: number;
  imageUrl?: string;
}

const KebayaSchema: Schema = new Schema({
  jenis: { type: String, required: true },
  warna: { type: String, required: true },
  price: { type: Number, required: true },
  totalStock: { type: Number, required: true },
  availableStock: { type: Number, required: true },
  imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IKebaya>('Kebaya', KebayaSchema);
