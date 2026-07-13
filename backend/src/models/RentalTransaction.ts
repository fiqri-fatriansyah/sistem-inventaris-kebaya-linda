import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';
import { IKebaya } from './Kebaya';

export interface IRentalTransaction extends Document {
  customerId: ICustomer['_id'];
  kebayaId: IKebaya['_id'];
  rentalStartTime: Date;
  rentalEndTime?: Date;
  amountToPay: number;
  status: 'Active' | 'Completed';
}

const RentalTransactionSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  kebayaId: { type: Schema.Types.ObjectId, ref: 'Kebaya', required: true },
  rentalStartTime: { type: Date, default: Date.now, required: true },
  rentalEndTime: { type: Date },
  amountToPay: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active', required: true }
}, { timestamps: true });

export default mongoose.model<IRentalTransaction>('RentalTransaction', RentalTransactionSchema);
