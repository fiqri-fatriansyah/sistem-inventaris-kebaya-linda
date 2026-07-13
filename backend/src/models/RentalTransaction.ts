import mongoose, { Schema, Document } from 'mongoose';

export interface IRentalTransaction extends Document {
  customerId: mongoose.Types.ObjectId | string;
  kebayaId: mongoose.Types.ObjectId | string;
  rentalStartTime: Date;
  expectedReturnDate: Date;
  rentalEndTime?: Date;
  status: 'Active' | 'Completed';
  amountToPay?: number;
  penaltyType: 'None' | 'One-time' | 'Daily' | 'Weekly';
  penaltyCost: number;
}

const RentalTransactionSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  kebayaId: { type: Schema.Types.ObjectId, ref: 'Kebaya', required: true },
  rentalStartTime: { type: Date, required: true, default: Date.now },
  expectedReturnDate: { type: Date, required: true },
  rentalEndTime: { type: Date },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  amountToPay: { type: Number },
  penaltyType: { type: String, enum: ['None', 'One-time', 'Daily', 'Weekly'], default: 'None' },
  penaltyCost: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.RentalTransaction || mongoose.model<IRentalTransaction>('RentalTransaction', RentalTransactionSchema);
