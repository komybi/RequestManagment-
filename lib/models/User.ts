import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  studentId?: string;
  role: 'student' | 'admin' | 'registrar' | 'revenue';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'registrar', 'revenue'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.User) || mongoose.model<IUser>('User', userSchema);
