import { Document, Schema, model } from 'mongoose';
// import ICreated from '../created';
export interface IQuestion extends Document {
  key: string;
  categories: string;
  kind: number;
  level: number;
  point: number;
  content: string;
  answers: any[];
  correct: number[];
  tags: string[];
  order: number;
  flag: number;
  // created?: ICreated;
}
const schema = new Schema({
  key: { type: String, required: true },
  categories: { type: String, default: null },
  kind: { type: Number, required: true },
  level: { type: Number, required: true },
  point: { type: Number, default: 1 },
  content: { type: String, required: true },
  answers: { type: Array, required: true },
  correct: { type: Array, required: true },
  tags: { type: Array, default: null },
  order: { type: Number, default: 1 },
  flag: { type: Number, default: 1 },
  // created: { type: Object, default: { at: new Date(), by: '', ip: '' } },
});
export const MQuestion = model<IQuestion>('questions', schema);
export default MQuestion;
