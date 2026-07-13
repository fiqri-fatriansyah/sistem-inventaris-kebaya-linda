import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  telephone: string;
  address?: string;
  email?: string;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  telephone: { type: String, required: true },
  address: { type: String },
  email: { type: String }
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
