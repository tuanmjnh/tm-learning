import { Document, Schema, model } from 'mongoose';
export interface IExercises extends Document {
  type: number;
  name: string;
  users: string[];
  questions: string[];
  startAt: Date;
  endAt: Date;
  numberTest: number;
  minutes: number;
  mixQuestion: number;
  mixAnswer: number;
  eligible: number;
  totalQuestion: number;
  desc: string;
  tags: string[];
  order: number;
  flag: number;
  createdAt: Date;
  createdBy: string;
  createdIp: string;
  // userAgent: string;
}
const schema = new Schema({
  type: { type: Number, default: 1 },
  name: { type: String, required: true },
  users: { type: Array, required: true },
  questions: { type: Array, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  numberTest: { type: Number, default: 1 },
  minutes: { type: Number, default: 60 },
  mixQuestion: { type: Number, default: 1 },
  mixAnswer: { type: Number, default: 1 },
  eligible: { type: Number, required: true },
  totalQuestion: { type: Number, required: true },
  desc: { type: String, default: null },
  tags: { type: Array, default: null },
  order: { type: Number, default: 1 },
  flag: { type: Number, default: 1 },
  createdAt: { type: Date, default: new Date() },
  createdBy: { type: String, required: true },
  createdIp: { type: String, required: true },
  // userAgent: { type: String, required: true },
});
export const MExercises = model<IExercises>('exercises', schema);
schema.index({ name: 'text' });
export default MExercises;
