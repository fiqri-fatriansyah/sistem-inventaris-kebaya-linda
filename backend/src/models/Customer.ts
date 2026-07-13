import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  contactInfo: string;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  contactInfo: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
