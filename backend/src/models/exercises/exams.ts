import { Document, Schema, model } from 'mongoose';
export interface IExams extends Document {
  startAt: Date;
  endAt: Date;
  startBy: string;
  startIp: string;
  // userAgent: string;
  exercise: string;
  totalQuestion: string;
  totalCorrect: number;
  totalWrong: number;
  questions: any[];
  result: number;
  flag: number;
}
const schema = new Schema({
  startAt: { type: Date, required: true },
  endAt: { type: Date },
  startBy: { type: String, required: true },
  startIp: { type: String, required: true },
  // userAgent: { type: String, required: true },
  exercise: { type: String, required: true },
  totalQuestion: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalWrong: { type: Number, default: 0 },
  questions: { type: Array, default: [] },
  result: { type: Number, default: 0 },
  flag: { type: Number, default: 1 },
});
export const MExams = model<IExams>('exams', schema);
export default MExams;
