import mongoose, { Schema, Document, LeanDocument } from 'mongoose';

export interface IUser extends Document {
  username: String,
  password: String,
  token?: String
}

export interface IUserJWT extends LeanDocument<IUser>{}


const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
  }
})

export default mongoose.model<IUser>('User', UserSchema);
