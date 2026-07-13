import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  date: Date;
  description?: string;
}

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
