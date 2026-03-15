import mongoose, { Schema, Document } from 'mongoose';

export interface IIDReplacementRequest extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  requestType: string;
  reason: string;
  description: string;
  replacementType: string;
  department?: string;
  program?: string;
  phoneNumber?: string;
  academicYear?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentVerified: boolean;
  receiptPath?: string;
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const idReplacementRequestSchema = new Schema<IIDReplacementRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
      default: 'ID_REPLACEMENT',
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    replacementType: {
      type: String,
      required: true,
      enum: ['lost', 'damaged', 'stolen', 'name-change'],
    },
    department: {
      type: String,
    },
    program: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    academicYear: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    receiptPath: {
      type: String,
    },
    rejectionReason: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    trackingNumber: {
      type: String,
      unique: true,
      default: () => `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.IDReplacementRequest) ||
  mongoose.model<IIDReplacementRequest>('IDReplacementRequest', idReplacementRequestSchema);
