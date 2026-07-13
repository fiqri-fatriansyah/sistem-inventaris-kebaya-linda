import mongoose, { Schema, Document } from 'mongoose';

export interface IConfig extends Document {
  penaltyType: 'None' | 'One-time' | 'Daily' | 'Weekly';
  penaltyCost: number;
}

const ConfigSchema: Schema = new Schema({
  penaltyType: { type: String, enum: ['None', 'One-time', 'Daily', 'Weekly'], default: 'None' },
  penaltyCost: { type: Number, default: 0 }
});

export default mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
