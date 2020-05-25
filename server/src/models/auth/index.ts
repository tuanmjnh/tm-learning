import { Document, Schema, model } from 'mongoose';
export interface IAuth extends Document {
  username: string;
  password: string;
  remember: boolean;
  token: string;
}
const schema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  remember: { type: Boolean, default: false },
  token: { type: String, required: true },
});
export const MAuth = model<IAuth>('auth', schema);
export default MAuth;
