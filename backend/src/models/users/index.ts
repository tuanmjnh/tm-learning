import { Document, Schema, model } from 'mongoose';
import ICreated from '../created';
export interface IUser extends Document {
  group: string;
  username: string;
  password: string;
  salt: string;
  fullName: string;
  email: string;
  phone: string;
  personNumber: string;
  region: string;
  avatar: string;
  note: string;
  dateBirth: Date;
  gender: number;
  address: string;
  roles: string[];
  verified: boolean;
  enable: boolean;
  lastLogin?: Date;
  lastChangePass?: Date;
  created: ICreated;
}
const schema = new Schema({
  group: { type: String, default: null },
  username: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  fullName: { type: String, default: null },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  personNumber: { type: String, default: null },
  region: { type: String, default: 'vi-vn' },
  avatar: { type: String, default: null },
  note: { type: String, default: null },
  dateBirth: { type: Date, default: null },
  gender: { type: Number, default: 1 },
  address: { type: String, default: null },
  roles: { type: Array, default: null },
  verified: { type: Boolean, default: false },
  enable: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  lastChangePass: { type: Date, default: null },
  created: { type: Object, default: { at: new Date(), by: '', ip: '' } },
});
export const MUser = model<IUser>('users', schema);
export default MUser;
