import mongoose, { Schema, Document } from 'mongoose';

export interface IKebaya extends Document {
  name: string;
  type: string;
  price: number;
  totalStock: number;
  availableStock: number;
}

const KebayaSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  totalStock: { type: Number, required: true },
  availableStock: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IKebaya>('Kebaya', KebayaSchema);
