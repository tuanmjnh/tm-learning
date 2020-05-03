import { Document, Schema, model } from 'mongoose';
export interface IQuestionImport extends Document {
  code: number;
  total: number;
  createdAt: Date;
  createdBy: string;
  createdIp: string;
}
const schema = new Schema({
  code: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: new Date() },
  createdBy: { type: String, required: true },
  createdIp: { type: String, required: true },
});
export const MQuestionImport = model<IQuestionImport>('questions_import', schema);
export default MQuestionImport;
